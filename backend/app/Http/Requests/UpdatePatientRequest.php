<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'nic' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:160'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:60'],
            'postal_code' => ['sometimes', 'nullable', 'string', 'max:10'],
            'dob' => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender' => ['sometimes', 'nullable', 'in:male,female,other'],
            'blood_group' => ['sometimes', 'nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'height_cm' => ['sometimes', 'nullable', 'numeric', 'min:30', 'max:300'],
            'weight_kg' => ['sometimes', 'nullable', 'numeric', 'min:1', 'max:500'],
            'allergies' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'chronic_conditions' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'current_medications' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'past_surgeries' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['sometimes', 'nullable', 'string', 'max:120'],
            'emergency_contact_phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'language' => ['sometimes', 'in:en,si,ta'],
        ];
    }
}
