<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Report;
use Illuminate\View\View;

class DashboardController
{
    public function index(): View
    {
        return view('admin.dashboard', [
            'patientCount' => Patient::query()->count(),
            'reportCount' => Report::query()->count(),
            'pendingAppointments' => Appointment::query()->where('status', 'pending')->count(),
            'recentAppointments' => Appointment::query()
                ->with(['patient', 'doctor'])
                ->latest()
                ->limit(8)
                ->get(),
        ]);
    }
}
