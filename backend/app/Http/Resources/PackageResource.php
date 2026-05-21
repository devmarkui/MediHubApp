<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property Package $resource
 */
class PackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $p = $this->resource;

        return [
            'id' => $p->id,
            'code' => $p->code,
            'name' => $p->name,
            'name_si' => $p->name_si,
            'name_ta' => $p->name_ta,
            'description' => $p->description,
            'original_price' => (float) $p->original_price,
            'discounted_price' => (float) $p->discounted_price,
            'discount_percent' => (int) round((1 - ((float) $p->discounted_price / max(0.01, (float) $p->original_price))) * 100),
            'validity_days' => $p->validity_days,
            'total_visits' => $p->total_visits,
            'image_url' => $p->image_path
                ? Storage::disk('public')->url($p->image_path)
                : null,
            'inclusions' => $p->inclusions,
            'included_test_codes' => $p->included_test_codes,
            'is_featured' => $p->is_featured,
            'is_active' => $p->is_active,
            'display_order' => $p->display_order,
        ];
    }
}
