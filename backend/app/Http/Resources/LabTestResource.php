<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\LabTest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property LabTest $resource
 */
class LabTestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $t = $this->resource;

        return [
            'id' => $t->id,
            'code' => $t->code,
            'name' => $t->name,
            'name_si' => $t->name_si,
            'name_ta' => $t->name_ta,
            'description' => $t->description,
            'price' => (float) $t->price,
            'category' => $t->category,
            'is_active' => $t->is_active,
        ];
    }
}
