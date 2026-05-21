<?php

declare(strict_types=1);

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\LabOrder;
use App\Models\Package;
use App\Models\PackagePurchase;
use App\Models\Patient;
use Laravel\Sanctum\Sanctum;

it('returns a unified passbook feed across types', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000050', 'name' => 'P']);
    $doctor = Doctor::factory()->create();
    Appointment::factory()->create(['patient_id' => $patient->id, 'doctor_id' => $doctor->id]);
    LabOrder::factory()->create(['patient_id' => $patient->id]);
    $package = Package::factory()->create();
    PackagePurchase::factory()->create(['patient_id' => $patient->id, 'package_id' => $package->id]);

    Sanctum::actingAs($patient);
    $response = $this->getJson('/api/v1/passbook');
    $response->assertOk();
    expect($response->json('data.items'))->toHaveCount(3);
    $types = collect($response->json('data.items'))->pluck('type')->all();
    expect($types)->toContain('consultation', 'lab', 'package');
});

it('filters the passbook by type', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000051', 'name' => 'Q']);
    $doctor = Doctor::factory()->create();
    Appointment::factory()->create(['patient_id' => $patient->id, 'doctor_id' => $doctor->id]);
    LabOrder::factory()->create(['patient_id' => $patient->id]);

    Sanctum::actingAs($patient);
    $response = $this->getJson('/api/v1/passbook?type=lab');
    $response->assertOk();
    $items = $response->json('data.items');
    expect($items)->toHaveCount(1);
    expect($items[0]['type'])->toBe('lab');
});
