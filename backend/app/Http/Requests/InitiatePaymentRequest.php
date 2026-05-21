<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InitiatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payable_type' => ['required', 'in:appointment,lab_order,package_purchase'],
            'payable_id' => ['required', 'integer'],
        ];
    }
}
