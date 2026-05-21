<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class AppointmentService
{
    /**
     * Book a slot atomically — locks the slot row so two concurrent bookings cannot
     * both succeed for the same doctor / date / time.
     */
    public function book(Patient $patient, int $doctorId, string $date, string $time, ?string $notes): Appointment
    {
        return DB::transaction(function () use ($patient, $doctorId, $date, $time, $notes): Appointment {
            $doctor = Doctor::query()
                ->where('id', $doctorId)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (! $doctor) {
                throw new RuntimeException('Doctor not available.');
            }

            $clash = Appointment::query()
                ->where('doctor_id', $doctor->id)
                ->where('appointment_date', $date)
                ->where('appointment_time', $time)
                ->whereIn('status', ['pending', 'confirmed', 'completed'])
                ->lockForUpdate()
                ->exists();

            if ($clash) {
                throw new RuntimeException('That time slot has just been taken.');
            }

            return Appointment::query()->create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'appointment_date' => $date,
                'appointment_time' => $time,
                'status' => 'pending',
                'consultation_fee' => $doctor->consultation_fee,
                'payment_status' => 'unpaid',
                'notes' => $notes,
            ]);
        });
    }
}
