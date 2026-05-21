<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LabOrder;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabOrder>
 */
class LabOrderFactory extends Factory
{
    protected $model = LabOrder::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'total_amount' => fake()->randomElement([1500, 2500, 5000]),
            'payment_status' => 'paid',
            'status' => 'ordered',
            'collection_type' => 'walk_in',
            'ordered_at' => now(),
        ];
    }
}
