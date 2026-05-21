<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'otp_id' => ['required', 'integer'],
            'phone' => ['required', 'string', 'regex:/^\+947\d{8}$/'],
            'code' => ['required', 'string', 'digits:6'],
        ];
    }
}
