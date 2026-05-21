<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'doctor_id' => Doctor::factory(),
            'appointment_date' => now()->addDays(fake()->numberBetween(1, 14))->toDateString(),
            'appointment_time' => fake()->randomElement(['09:00', '10:00', '11:00', '14:00', '15:00']),
            'status' => 'confirmed',
            'consultation_fee' => 2500.00,
            'payment_status' => 'paid',
            'payment_method' => 'online',
        ];
    }
}
