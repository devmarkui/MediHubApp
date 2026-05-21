<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property Patient $resource
 */
class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $patient = $this->resource;

        return [
            'id' => $patient->id,
            'passbook_no' => $patient->passbook_no,
            'phone' => $patient->phone,
            'name' => $patient->name,
            'email' => $patient->email,
            'dob' => optional($patient->dob)->toDateString(),
            'gender' => $patient->gender,
            'blood_group' => $patient->blood_group,
            'language' => $patient->language,
            'avatar_url' => $patient->avatar_path
                ? Storage::disk('public')->url($patient->avatar_path)
                : null,
            'parent_patient_id' => $patient->parent_patient_id,
            'member_since' => optional($patient->member_since)->toDateString(),
            'is_active' => $patient->is_active,
            'created_at' => $patient->created_at?->toIso8601String(),
        ];
    }
}
