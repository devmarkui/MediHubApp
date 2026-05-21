<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\InitiatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\PackagePurchase;
use App\Models\Patient;
use App\Models\Payment;
use App\Services\PayHereService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController
{
    public function __construct(private PayHereService $payhere) {}

    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $type = (string) $request->validated('payable_type');
        $id = (int) $request->validated('payable_id');

        $payable = $this->payhere->resolvePayable($type, $id);
        abort_if($payable === null, 404, 'Payable not found.');

        // Ownership check
        $ownerId = $payable->patient_id ?? null;
        abort_if($ownerId !== $patient->id, 403, 'Not allowed.');

        $morphClass = match (true) {
            $payable instanceof Appointment => Appointment::class,
            $payable instanceof LabOrder => LabOrder::class,
            $payable instanceof PackagePurchase => PackagePurchase::class,
            default => null,
        };

        abort_if($morphClass === null, 422, 'Unsupported payable.');

        $amount = $this->payhere->payableAmount($payable);

        $payment = Payment::query()->create([
            'patient_id' => $patient->id,
            'amount' => $amount,
            'currency' => 'LKR',
            'method' => 'payhere',
            'status' => 'pending',
            'payable_type' => $morphClass,
            'payable_id' => $payable->id,
        ]);

        $params = $this->payhere->buildCheckoutParams(
            $patient,
            $payment,
            $this->payhere->payableLabel($payable)
        );

        return ApiResponse::ok([
            'payment' => (new PaymentResource($payment))->resolve(),
            'checkout_url' => $this->payhere->checkoutUrl(),
            'params' => $params,
        ], 'Payment initiated.');
    }

    public function show(Request $request, Payment $payment): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        abort_if($payment->patient_id !== $patient->id, 404, 'Payment not found.');

        return ApiResponse::ok((new PaymentResource($payment))->resolve());
    }

    public function payhereNotify(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('[PayHere] notify', $payload);

        if (! $this->payhere->verifyNotifySignature($payload)) {
            return ApiResponse::fail('Invalid signature.', 400);
        }

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');

        $payment = Payment::query()->where('payment_no', $orderId)->first();
        if (! $payment) {
            return ApiResponse::fail('Unknown order.', 404);
        }

        $payment->gateway_reference = (string) ($payload['payment_id'] ?? null);
        $payment->gateway_response = $payload;

        if ($statusCode === '2') {
            $payment->status = 'success';
            $payment->paid_at = now();
            $payment->save();

            $this->markPayableAsPaid($payment);
        } elseif ($statusCode === '0') {
            $payment->status = 'pending';
            $payment->save();
        } else {
            $payment->status = 'failed';
            $payment->save();
        }

        return ApiResponse::ok(null, 'ok');
    }

    private function markPayableAsPaid(Payment $payment): void
    {
        $payable = $payment->payable;
        if ($payable instanceof Appointment) {
            $payable->payment_status = 'paid';
            $payable->payment_method = 'online';
            if ($payable->status === 'pending') {
                $payable->status = 'confirmed';
            }
            $payable->save();
        } elseif ($payable instanceof LabOrder) {
            $payable->payment_status = 'paid';
            $payable->save();
        } elseif ($payable instanceof PackagePurchase) {
            $payable->status = 'active';
            $payable->save();
        }
    }
}
