<?php

declare(strict_types=1);

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Laravel\Sanctum\Sanctum;

it('books an appointment and prevents double-booking the same slot', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000001', 'name' => 'A']);
    $other = Patient::query()->create(['phone' => '+94770000002', 'name' => 'B']);
    $doctor = Doctor::factory()->create();

    Sanctum::actingAs($patient);
    $first = $this->postJson('/api/v1/appointments', [
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(2)->toDateString(),
        'time' => '10:00',
    ]);
    $first->assertCreated();

    Sanctum::actingAs($other);
    $second = $this->postJson('/api/v1/appointments', [
        'doctor_id' => $doctor->id,
        'date' => now()->addDays(2)->toDateString(),
        'time' => '10:00',
    ]);
    $second->assertStatus(409);
});

it('cancels an appointment owned by the patient', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000003', 'name' => 'C']);
    $doctor = Doctor::factory()->create();
    $appt = Appointment::factory()->create(['patient_id' => $patient->id, 'doctor_id' => $doctor->id, 'status' => 'confirmed']);

    Sanctum::actingAs($patient);
    $response = $this->postJson("/api/v1/appointments/{$appt->id}/cancel");
    $response->assertOk()->assertJsonPath('data.status', 'cancelled');
});
