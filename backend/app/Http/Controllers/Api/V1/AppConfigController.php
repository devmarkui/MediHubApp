<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class AppConfigController
{
    public function __invoke(): JsonResponse
    {
        // Stage 4 — clinic opening hours (08:00–21:00, every day).
        $openHour = 8;   // 8:00 AM
        $closeHour = 21; // 9:00 PM
        $now = (int) now()->format('G');
        $isOpen = $now >= $openHour && $now < $closeHour;

        return ApiResponse::ok([
            'clinic_info' => [
                'name' => 'MediHub Clinic & Laboratory (Pvt) Ltd',
                'address' => 'Wellampitiya, Sri Lanka',
                'phone' => '+94112345678',
                'email' => 'hello@medihub.lk',
                'hours' => 'Open every day · 8:00 AM – 9:00 PM',
            ],
            'opening_hours' => [
                'open_time' => '08:00',
                'close_time' => '21:00',
                'open_label' => '8:00 AM',
                'close_label' => '9:00 PM',
                'days_label' => 'Open every day',
                'is_open_now' => $isOpen,
            ],
            'banner' => [
                'title' => 'WE\'RE OPEN TODAY',
                'subtitle' => '8:00 AM – 9:00 PM · Every day',
                'action_code' => null,
            ],
            'appointment_whatsapp' => '+94752977591',
            'min_supported_version' => '1.0.0',
            'force_update_version' => '1.0.0',
            'maintenance_mode' => false,
            'support_phone' => '+94112345678',
            'support_whatsapp' => '+94752977591',
            'currency' => 'LKR',
            'terms_url' => 'https://medihub.lk/terms',
            'privacy_url' => 'https://medihub.lk/privacy',
        ]);
    }
}
