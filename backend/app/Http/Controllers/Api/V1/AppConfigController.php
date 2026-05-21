<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AppConfigController
{
    public function __invoke(): JsonResponse
    {
        return ApiResponse::ok([
            'clinic_info' => [
                'name' => 'MediHub Clinic & Laboratory (Pvt) Ltd',
                'address' => 'Wellampitiya, Sri Lanka',
                'phone' => '+94112345678',
                'email' => 'hello@medihub.lk',
                'hours' => 'Mon–Sat 8:00 AM – 8:00 PM',
            ],
            'banner' => [
                'title' => 'LAUNCH SPECIAL · 25% OFF',
                'subtitle' => 'Full Body Check-up',
                'action_code' => 'PKG-FULL-BODY',
            ],
            'min_supported_version' => '1.0.0',
            'force_update_version' => '1.0.0',
            'maintenance_mode' => false,
            'support_phone' => '+94112345678',
            'support_whatsapp' => '+94771234567',
            'currency' => 'LKR',
            'terms_url' => 'https://medihub.lk/terms',
            'privacy_url' => 'https://medihub.lk/privacy',
        ]);
    }
}
