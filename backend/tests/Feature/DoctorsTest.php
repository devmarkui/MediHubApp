<?php

declare(strict_types=1);

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use Laravel\Sanctum\Sanctum;

it('lists active doctors', function (): void {
    Doctor::factory()->create(['name' => 'Dr. Active', 'is_active' => true]);
    Doctor::factory()->create(['name' => 'Dr. Inactive', 'is_active' => false]);

    $response = $this->getJson('/api/v1/doctors');
    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

it('returns available slots for a doctor on a working day', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000001', 'name' => 'X']);
    Sanctum::actingAs($patient);

    $doctor = Doctor::factory()->create();
    DoctorSchedule::query()->create([
        'doctor_id' => $doctor->id,
        'day_of_week' => strtolower(substr(now()->addDay()->format('D'), 0, 3)),
        'start_time' => '09:00:00',
        'end_time' => '10:00:00',
        'slot_minutes' => 30,
        'max_patients' => 10,
        'is_active' => true,
    ]);

    $date = now()->addDay()->toDateString();
    $response = $this->getJson("/api/v1/doctors/{$doctor->id}/available-slots?date={$date}");
    $response->assertOk();
    $slots = $response->json('data.slots');
    expect($slots)->toHaveCount(2);
    expect($slots[0]['time'])->toBe('09:00');
});
