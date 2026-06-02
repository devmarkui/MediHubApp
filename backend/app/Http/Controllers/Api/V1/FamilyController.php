<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\FamilyMemberRequest;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FamilyController
{
    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $members = $patient->familyMembers()->orderBy('name')->get();

        return ApiResponse::ok(PatientResource::collection($members)->resolve());
    }

    public function store(FamilyMemberRequest $request): JsonResponse
    {
        /** @var Patient $parent */
        $parent = $request->user();

        // Family members don't log in, but the patients table requires a unique
        // phone — derive a guaranteed-unique placeholder from the parent's number.
        do {
            $phone = $parent->phone.'-'.random_int(100000, 999999);
        } while (Patient::query()->where('phone', $phone)->exists());

        $member = Patient::query()->create(array_merge(
            $request->validated(),
            [
                'phone' => $phone,
                'parent_patient_id' => $parent->id,
                'language' => $parent->language,
            ]
        ));

        return ApiResponse::ok((new PatientResource($member))->resolve(), 'Family member added.', 201);
    }

    public function update(FamilyMemberRequest $request, int $id): JsonResponse
    {
        /** @var Patient $parent */
        $parent = $request->user();

        $member = Patient::query()
            ->where('parent_patient_id', $parent->id)
            ->where('id', $id)
            ->firstOrFail();

        $member->fill($request->validated());
        $member->save();

        return ApiResponse::ok((new PatientResource($member))->resolve(), 'Family member updated.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var Patient $parent */
        $parent = $request->user();

        $member = Patient::query()
            ->where('parent_patient_id', $parent->id)
            ->where('id', $id)
            ->firstOrFail();

        $member->delete();

        return ApiResponse::ok(null, 'Family member removed.');
    }
}
