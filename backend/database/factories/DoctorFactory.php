<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Doctor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Doctor>
 */
class DoctorFactory extends Factory
{
    protected $model = Doctor::class;

    public function definition(): array
    {
        $name = 'Dr. '.fake()->name();

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'specialization' => fake()->randomElement(['General Physician', 'Cardiologist', 'Paediatrician']),
            'qualifications' => 'MBBS, MD',
            'bio' => fake()->paragraph(),
            'consultation_fee' => fake()->randomElement([2000, 2500, 3000, 3500]),
            'languages' => ['en', 'si'],
            'is_active' => true,
            'display_order' => 0,
        ];
    }
}
