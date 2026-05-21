<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\PackagePurchase;
use App\Models\Patient;
use App\Models\Payment;
use App\Observers\AppointmentObserver;
use App\Observers\LabOrderObserver;
use App\Observers\PackagePurchaseObserver;
use App\Observers\PatientObserver;
use App\Observers\PaymentObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Patient::observe(PatientObserver::class);
        Appointment::observe(AppointmentObserver::class);
        LabOrder::observe(LabOrderObserver::class);
        PackagePurchase::observe(PackagePurchaseObserver::class);
        Payment::observe(PaymentObserver::class);
    }
}
