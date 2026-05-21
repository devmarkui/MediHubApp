<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Payment $resource
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $p = $this->resource;

        return [
            'id' => $p->id,
            'payment_no' => $p->payment_no,
            'amount' => (float) $p->amount,
            'currency' => $p->currency,
            'method' => $p->method,
            'status' => $p->status,
            'payable_type' => $p->payable_type,
            'payable_id' => $p->payable_id,
            'paid_at' => $p->paid_at?->toIso8601String(),
            'created_at' => $p->created_at?->toIso8601String(),
        ];
    }
}
