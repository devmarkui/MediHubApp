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
            'otp_id' => ['required', 'integer'],
            'code' => ['required', 'string', 'digits:6'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:160'],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
        ];
    }
}
