<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FamilyMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'dob' => ['nullable', 'date', 'before:tomorrow'],
            'gender' => ['nullable', 'in:male,female,other'],
            'blood_group' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
        ];
    }
}
