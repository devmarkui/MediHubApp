<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\OtpVerification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class OtpService
{
    private const EXPIRY_MINUTES = 5;

    private const MAX_ATTEMPTS = 3;

    public function issue(string $phone): OtpVerification
    {
        // Local/testing convenience: always issue the same dev code so the QA flow
        // doesn't need to tail the log file. Production randomises per request.
        $code = app()->environment('local', 'testing')
            ? '123456'
            : (string) random_int(100000, 999999);

        $record = OtpVerification::query()->create([
            'phone' => $phone,
            'code' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::EXPIRY_MINUTES),
            'verified_at' => null,
        ]);

        // Local development convenience: emit the plain code to logs.
        if (app()->environment('local', 'testing')) {
            Log::info('[OTP] phone='.$phone.' code='.$code);
        }

        // TODO: integrate notify.lk SMS gateway in production.

        return $record;
    }

    public function verify(int $otpId, string $phone, string $code): bool
    {
        $record = OtpVerification::query()
            ->where('id', $otpId)
            ->where('phone', $phone)
            ->first();

        if (! $record) {
            return false;
        }

        if ($record->verified_at !== null) {
            return false;
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }

        if ($record->expires_at instanceof Carbon && $record->expires_at->isPast()) {
            return false;
        }

        $record->increment('attempts');

        if (! Hash::check($code, $record->code)) {
            return false;
        }

        $record->verified_at = now();
        $record->save();

        return true;
    }
}
