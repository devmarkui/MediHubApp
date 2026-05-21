<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\LabOrder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property LabOrder $resource
 */
class LabOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $o = $this->resource;

        return [
            'id' => $o->id,
            'order_no' => $o->order_no,
            'patient_id' => $o->patient_id,
            'total_amount' => (float) $o->total_amount,
            'payment_status' => $o->payment_status,
            'status' => $o->status,
            'collection_type' => $o->collection_type,
            'ordered_at' => $o->ordered_at?->toIso8601String(),
            'ready_at' => $o->ready_at?->toIso8601String(),
            'items' => $o->relationLoaded('items')
                ? $o->items->map(fn ($item) => [
                    'id' => $item->id,
                    'lab_test_id' => $item->lab_test_id,
                    'test' => $item->relationLoaded('test') && $item->test
                        ? (new LabTestResource($item->test))->resolve()
                        : null,
                    'price' => (float) $item->price,
                    'result_value' => $item->result_value,
                    'result_unit' => $item->result_unit,
                    'result_normal_range' => $item->result_normal_range,
                    'is_abnormal' => $item->is_abnormal,
                ])->all()
                : null,
        ];
    }
}
