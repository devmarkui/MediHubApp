<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }
}
