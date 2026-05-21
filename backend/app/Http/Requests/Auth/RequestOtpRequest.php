<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RequestOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^\+947\d{8}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Phone must be a Sri Lankan mobile number in the format +947XXXXXXXX.',
        ];
    }
}
