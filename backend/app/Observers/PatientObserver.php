<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Patient;
use App\Services\SerialNumberService;

class PatientObserver
{
    public function __construct(private SerialNumberService $serials) {}

    public function creating(Patient $patient): void
    {
        if (empty($patient->passbook_no)) {
            $patient->passbook_no = $this->serials->next('MH');
        }
        if (empty($patient->member_since)) {
            $patient->member_since = now()->toDateString();
        }
    }
}
