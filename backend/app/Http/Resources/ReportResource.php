<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Report $resource
 */
class ReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $r = $this->resource;

        return [
            'id' => $r->id,
            'patient_id' => $r->patient_id,
            'lab_order_id' => $r->lab_order_id,
            'appointment_id' => $r->appointment_id,
            'report_type' => $r->report_type,
            'title' => $r->title,
            'file_size_kb' => $r->file_size_kb,
            'released_at' => $r->released_at?->toIso8601String(),
        ];
    }
}
