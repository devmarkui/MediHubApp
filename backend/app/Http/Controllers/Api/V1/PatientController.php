<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\UpdatePatientRequest;
use App\Http\Requests\UpdatePushTokenRequest;
use App\Http\Requests\UploadAvatarRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController
{
    public function show(Request $request): JsonResponse
    {
        $patient = $this->patient($request);

        return ApiResponse::ok((new PatientResource($patient))->resolve());
    }

    public function update(UpdatePatientRequest $request): JsonResponse
    {
        $patient = $this->patient($request);
        $patient->fill($request->validated());
        $patient->save();

        return ApiResponse::ok((new PatientResource($patient))->resolve(), 'Profile updated.');
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $patient = $this->patient($request);

        $path = $request->file('avatar')->store('avatars', 'public');
        $patient->avatar_path = $path;
        $patient->save();

        return ApiResponse::ok((new PatientResource($patient))->resolve(), 'Avatar updated.');
    }

    public function updatePushToken(UpdatePushTokenRequest $request): JsonResponse
    {
        $patient = $this->patient($request);
        $patient->expo_push_token = (string) $request->validated('expo_push_token');
        $patient->save();

        return ApiResponse::ok(null, 'Push token registered.');
    }

    private function patient(Request $request): Patient
    {
        /** @var Patient $patient */
        $patient = $request->user();

        return $patient;
    }
}
