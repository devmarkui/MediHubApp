<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Patient>
 */
class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        return [
            'phone' => '+9477'.fake()->unique()->numerify('#######'),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'dob' => fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female']),
            'blood_group' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
            'language' => 'en',
            'is_active' => true,
        ];
    }
}
