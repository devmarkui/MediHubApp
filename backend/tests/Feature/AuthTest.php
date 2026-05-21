<?php

declare(strict_types=1);

use App\Models\OtpVerification;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;

it('rejects invalid phone numbers', function (): void {
    $response = $this->postJson('/api/v1/auth/request-otp', ['phone' => '0771234567']);
    $response->assertStatus(422);
});

it('issues an OTP and verifies it for an existing patient', function (): void {
    Patient::query()->create([
        'phone' => '+94771112233',
        'name' => 'Existing Patient',
    ]);

    $issue = $this->postJson('/api/v1/auth/request-otp', ['phone' => '+94771112233']);
    $issue->assertOk()->assertJsonPath('success', true);

    /** @var OtpVerification $record */
    $record = OtpVerification::query()->latest()->firstOrFail();
    $code = '654321';
    $record->code = Hash::make($code);
    $record->save();

    $verify = $this->postJson('/api/v1/auth/verify-otp', [
        'phone' => '+94771112233',
        'otp_id' => $record->id,
        'code' => $code,
    ]);

    $verify->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.is_new', false)
        ->assertJsonStructure(['data' => ['token', 'patient' => ['id', 'passbook_no', 'phone']]]);
});

it('registers a new patient after OTP verification', function (): void {
    $this->postJson('/api/v1/auth/request-otp', ['phone' => '+94772223344'])->assertOk();

    /** @var OtpVerification $record */
    $record = OtpVerification::query()->latest()->firstOrFail();
    $code = '111222';
    $record->code = Hash::make($code);
    $record->save();

    $response = $this->postJson('/api/v1/auth/register', [
        'phone' => '+94772223344',
        'otp_id' => $record->id,
        'code' => $code,
        'name' => 'Newly Registered',
        'email' => 'new@example.com',
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.patient.name', 'Newly Registered')
        ->assertJsonPath('data.patient.passbook_no', 'MH-'.now()->year.'-00001');
});
