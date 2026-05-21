<?php

declare(strict_types=1);

use App\Models\LabTest;
use App\Models\Patient;
use Laravel\Sanctum\Sanctum;

it('creates a lab order summing prices server-side', function (): void {
    $patient = Patient::query()->create(['phone' => '+94770000010', 'name' => 'L']);

    $a = LabTest::factory()->create(['price' => 500]);
    $b = LabTest::factory()->create(['price' => 800]);

    Sanctum::actingAs($patient);
    $response = $this->postJson('/api/v1/lab-orders', [
        'test_ids' => [$a->id, $b->id],
        'collection_type' => 'walk_in',
    ]);

    $response->assertCreated();
    expect((float) $response->json('data.total_amount'))->toEqual(1300.0);
    expect($response->json('data.items'))->toHaveCount(2);
});
