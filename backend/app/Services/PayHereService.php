<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\PackagePurchase;
use App\Models\Patient;
use App\Models\Payment;

class PayHereService
{
    public function checkoutUrl(): string
    {
        return ((string) config('services.payhere.mode')) === 'live'
            ? 'https://www.payhere.lk/pay/checkout'
            : 'https://sandbox.payhere.lk/pay/checkout';
    }

    /**
     * Build the parameters PayHere expects for a hosted checkout call.
     *
     * @return array<string, mixed>
     */
    public function buildCheckoutParams(Patient $patient, Payment $payment, string $itemsLabel): array
    {
        $merchantId = (string) config('services.payhere.merchant_id');
        $secret = (string) config('services.payhere.merchant_secret');

        $orderId = $payment->payment_no;
        $amount = number_format((float) $payment->amount, 2, '.', '');
        $currency = $payment->currency;

        $hash = strtoupper(md5(
            $merchantId.$orderId.$amount.$currency.strtoupper(md5($secret))
        ));

        return [
            'merchant_id' => $merchantId,
            'return_url' => (string) config('services.payhere.return_url'),
            'cancel_url' => (string) config('services.payhere.cancel_url'),
            'notify_url' => (string) config('services.payhere.notify_url'),
            'order_id' => $orderId,
            'items' => $itemsLabel,
            'currency' => $currency,
            'amount' => $amount,
            'first_name' => $patient->name,
            'last_name' => '',
            'email' => $patient->email ?? 'patient@medihub.lk',
            'phone' => $patient->phone,
            'address' => 'Wellampitiya',
            'city' => 'Colombo',
            'country' => 'Sri Lanka',
            'hash' => $hash,
        ];
    }

    /**
     * Verify the md5sig PayHere sends with notify callbacks.
     */
    public function verifyNotifySignature(array $payload): bool
    {
        $merchantId = (string) ($payload['merchant_id'] ?? '');
        $orderId = (string) ($payload['order_id'] ?? '');
        $paymentId = (string) ($payload['payment_id'] ?? '');
        $payhereAmount = (string) ($payload['payhere_amount'] ?? '');
        $payhereCurrency = (string) ($payload['payhere_currency'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $md5sig = strtoupper((string) ($payload['md5sig'] ?? ''));

        $secret = (string) config('services.payhere.merchant_secret');

        $expected = strtoupper(md5(
            $merchantId.$orderId.$payhereAmount.$payhereCurrency.$statusCode.strtoupper(md5($secret))
        ));

        return hash_equals($expected, $md5sig);
    }

    public function resolvePayable(string $type, int $id): ?object
    {
        return match ($type) {
            'appointment' => Appointment::query()->find($id),
            'lab_order' => LabOrder::query()->find($id),
            'package_purchase' => PackagePurchase::query()->find($id),
            default => null,
        };
    }

    public function payableLabel(object $payable): string
    {
        return match (true) {
            $payable instanceof Appointment => 'Consultation '.$payable->appointment_no,
            $payable instanceof LabOrder => 'Lab order '.$payable->order_no,
            $payable instanceof PackagePurchase => 'Package '.$payable->purchase_no,
            default => 'MediHub payment',
        };
    }

    public function payableAmount(object $payable): float
    {
        return match (true) {
            $payable instanceof Appointment => (float) $payable->consultation_fee,
            $payable instanceof LabOrder => (float) $payable->total_amount,
            $payable instanceof PackagePurchase => (float) $payable->amount_paid,
            default => 0.0,
        };
    }
}
