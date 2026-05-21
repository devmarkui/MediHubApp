<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['required', 'string', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
