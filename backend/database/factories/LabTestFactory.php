<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LabTest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabTest>
 */
class LabTestFactory extends Factory
{
    protected $model = LabTest::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'code' => 'T'.fake()->unique()->numerify('####'),
            'name' => ucwords($name),
            'name_si' => null,
            'name_ta' => null,
            'description' => fake()->sentence(),
            'price' => fake()->randomElement([500, 800, 1200, 2500, 4500]),
            'category' => fake()->randomElement(['Hematology', 'Biochemistry', 'Endocrinology', 'Immunology', 'Microbiology']),
            'is_active' => true,
        ];
    }
}
