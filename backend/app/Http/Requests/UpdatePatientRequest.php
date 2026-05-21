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
            'email' => ['sometimes', 'nullable', 'email', 'max:160'],
            'dob' => ['sometimes', 'nullable', 'date', 'before:today'],
            'gender' => ['sometimes', 'nullable', 'in:male,female,other'],
            'blood_group' => ['sometimes', 'nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'language' => ['sometimes', 'in:en,si,ta'],
        ];
    }
}
