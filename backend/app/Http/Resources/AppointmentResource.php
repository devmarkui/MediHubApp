<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Appointment $resource
 */
class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $a = $this->resource;

        return [
            'id' => $a->id,
            'appointment_no' => $a->appointment_no,
            'patient_id' => $a->patient_id,
            'doctor' => $a->relationLoaded('doctor') && $a->doctor
                ? (new DoctorResource($a->doctor))->resolve()
                : null,
            'doctor_id' => $a->doctor_id,
            'appointment_date' => optional($a->appointment_date)->toDateString(),
            'appointment_time' => $a->appointment_time,
            'status' => $a->status,
            'consultation_fee' => (float) $a->consultation_fee,
            'payment_status' => $a->payment_status,
            'payment_method' => $a->payment_method,
            'notes' => $a->notes,
            'created_at' => $a->created_at?->toIso8601String(),
        ];
    }
}
