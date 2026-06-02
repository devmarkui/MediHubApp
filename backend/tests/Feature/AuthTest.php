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

it('registers a new patient with phone + password (no OTP required)', function (): void {
    $response = $this->postJson('/api/v1/auth/register', [
        'phone' => '+94772223344',
        'name' => 'Newly Registered',
        'password' => 'secret123',
        'email' => 'new@example.com',
        'height_cm' => 170,
        'weight_kg' => 68,
    ]);

    $response->assertCreated()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.patient.name', 'Newly Registered')
        ->assertJsonPath('data.patient.bmi', 23.5)
        ->assertJsonPath('data.patient.passbook_no', 'MH-'.now()->year.'-00001');
});

it('signs in with phone + password', function (): void {
    Patient::query()->create([
        'phone' => '+94773334455',
        'name' => 'Password User',
        'password' => 'mypassword',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'phone' => '+94773334455',
        'password' => 'mypassword',
    ])->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure(['data' => ['token', 'patient' => ['id', 'phone']]]);
});

it('rejects login with the wrong password', function (): void {
    Patient::query()->create([
        'phone' => '+94774445566',
        'name' => 'Password User',
        'password' => 'correct-horse',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'phone' => '+94774445566',
        'password' => 'wrong',
    ])->assertStatus(422)->assertJsonPath('success', false);
});
