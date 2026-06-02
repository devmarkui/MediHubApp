<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^\+947\d{8}$/'],
            'name' => ['required', 'string', 'max:120'],
            'password' => ['required', 'string', 'min:6', 'max:72'],
            'email' => ['nullable', 'email', 'max:160'],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            // Stage 2 — optional BMI basics captured at sign-up.
            'height_cm' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'weight_kg' => ['nullable', 'numeric', 'min:1', 'max:500'],
            // OTP scaffolding kept optional so the app can switch to OTP later.
            'otp_id' => ['nullable', 'integer'],
            'code' => ['nullable', 'string', 'digits:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be a Sri Lankan mobile number in the format +947XXXXXXXX.',
        ];
    }
}
