<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\PackagePurchase;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property PackagePurchase $resource
 */
class PackagePurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $p = $this->resource;

        return [
            'id' => $p->id,
            'purchase_no' => $p->purchase_no,
            'package' => $p->relationLoaded('package') && $p->package
                ? (new PackageResource($p->package))->resolve()
                : null,
            'amount_paid' => (float) $p->amount_paid,
            'purchased_at' => $p->purchased_at?->toIso8601String(),
            'expires_at' => $p->expires_at?->toIso8601String(),
            'visits_used' => $p->visits_used,
            'visits_total' => $p->visits_total,
            'status' => $p->status,
        ];
    }
}
