<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CreateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\Patient;
use App\Services\AppointmentService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AppointmentController
{
    public function __construct(private AppointmentService $service) {}

    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        $status = (string) $request->query('status', 'all');

        $query = $patient->appointments()->with('doctor')->orderByDesc('appointment_date')->orderByDesc('appointment_time');

        if ($status === 'upcoming') {
            $query->whereIn('status', ['pending', 'confirmed'])
                ->where('appointment_date', '>=', now()->toDateString());
        } elseif ($status === 'past') {
            $query->where(function ($q) {
                $q->whereIn('status', ['completed', 'cancelled', 'no_show'])
                    ->orWhere('appointment_date', '<', now()->toDateString());
            });
        }

        return ApiResponse::ok(AppointmentResource::collection($query->get())->resolve());
    }

    public function show(Request $request, Appointment $appointment): JsonResponse
    {
        $this->ensureOwner($request, $appointment);
        $appointment->load('doctor');

        return ApiResponse::ok((new AppointmentResource($appointment))->resolve());
    }

    public function store(CreateAppointmentRequest $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        try {
            $appointment = $this->service->book(
                $patient,
                (int) $request->validated('doctor_id'),
                (string) $request->validated('date'),
                (string) $request->validated('time'),
                $request->validated('notes'),
            );
        } catch (RuntimeException $e) {
            return ApiResponse::fail($e->getMessage(), 409);
        }

        $appointment->load('doctor');

        return ApiResponse::ok((new AppointmentResource($appointment))->resolve(), 'Appointment booked.', 201);
    }

    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        $this->ensureOwner($request, $appointment);

        if (in_array($appointment->status, ['completed', 'cancelled'], true)) {
            return ApiResponse::fail('Appointment cannot be cancelled in its current state.', 422);
        }

        $appointment->status = 'cancelled';
        $appointment->save();

        return ApiResponse::ok((new AppointmentResource($appointment))->resolve(), 'Appointment cancelled.');
    }

    private function ensureOwner(Request $request, Appointment $appointment): void
    {
        /** @var Patient $patient */
        $patient = $request->user();
        abort_if($appointment->patient_id !== $patient->id, 404, 'Appointment not found.');
    }
}
