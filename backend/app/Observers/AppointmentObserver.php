<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Appointment;
use App\Services\SerialNumberService;

class AppointmentObserver
{
    public function __construct(private SerialNumberService $serials) {}

    public function creating(Appointment $appointment): void
    {
        if (empty($appointment->appointment_no)) {
            $appointment->appointment_no = $this->serials->next('APT');
        }
    }
}
