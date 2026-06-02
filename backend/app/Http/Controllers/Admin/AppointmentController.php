<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AppointmentController
{
    /**
     * Stage 5 — appointment requests sent from the app land here.
     */
    public function index(Request $request): View
    {
        $status = (string) $request->query('status', 'all');

        $appointments = Appointment::query()
            ->with(['patient', 'doctor'])
            ->when(in_array($status, ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'], true),
                fn ($q) => $q->where('status', $status))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->limit(100)
            ->get();

        return view('admin.appointments.index', [
            'appointments' => $appointments,
            'status' => $status,
        ]);
    }

    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,completed,cancelled,no_show'],
        ]);

        $appointment->status = $data['status'];
        $appointment->save();

        return back()->with('status', 'Appointment updated.');
    }
}
