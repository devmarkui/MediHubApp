<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property Doctor $resource
 */
class DoctorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $doctor = $this->resource;

        return [
            'id' => $doctor->id,
            'name' => $doctor->name,
            'slug' => $doctor->slug,
            'specialization' => $doctor->specialization,
            'qualifications' => $doctor->qualifications,
            'bio' => $doctor->bio,
            'avatar_url' => $doctor->avatar_path
                ? Storage::disk('public')->url($doctor->avatar_path)
                : null,
            'consultation_fee' => (float) $doctor->consultation_fee,
            'languages' => $doctor->languages,
            'is_active' => $doctor->is_active,
            'display_order' => $doctor->display_order,
        ];
    }
}
