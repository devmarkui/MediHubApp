<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateLabOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'test_ids' => ['required', 'array', 'min:1'],
            'test_ids.*' => ['integer', 'exists:lab_tests,id'],
            'collection_type' => ['required', 'in:walk_in,home'],
        ];
    }
}
