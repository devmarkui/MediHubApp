<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\DoctorResource;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DoctorController
{
    public function index(): JsonResponse
    {
        $doctors = Doctor::query()
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return ApiResponse::ok(DoctorResource::collection($doctors)->resolve());
    }

    public function show(Doctor $doctor): JsonResponse
    {
        abort_if(! $doctor->is_active, 404, 'Doctor not found.');

        $payload = (new DoctorResource($doctor))->resolve();
        $payload['schedules'] = $doctor->schedules()->where('is_active', true)->get()->map(fn ($s) => [
            'day_of_week' => $s->day_of_week,
            'start_time' => $s->start_time,
            'end_time' => $s->end_time,
            'slot_minutes' => $s->slot_minutes,
            'max_patients' => $s->max_patients,
        ])->all();

        return ApiResponse::ok($payload);
    }

    public function slots(int $doctor_id, Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $doctor = Doctor::query()->where('id', $doctor_id)->where('is_active', true)->first();
        abort_if($doctor === null, 404, 'Doctor not found.');

        $date = Carbon::createFromFormat('Y-m-d', (string) $request->query('date'));
        if ($date === false) {
            return ApiResponse::fail('Invalid date.', 422);
        }

        $day = strtolower(substr($date->format('D'), 0, 3));

        $schedule = $doctor->schedules()
            ->where('day_of_week', $day)
            ->where('is_active', true)
            ->first();

        if (! $schedule) {
            return ApiResponse::ok(['slots' => []]);
        }

        $start = Carbon::createFromFormat('H:i:s', $schedule->start_time);
        $end = Carbon::createFromFormat('H:i:s', $schedule->end_time);
        if ($start === false || $end === false) {
            return ApiResponse::ok(['slots' => []]);
        }

        $taken = Appointment::query()
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $date->toDateString())
            ->whereIn('status', ['pending', 'confirmed', 'completed'])
            ->pluck('appointment_time')
            ->map(fn (string $t) => substr($t, 0, 5))
            ->all();

        $slots = [];
        $cursor = $start->copy();
        while ($cursor->lt($end)) {
            $label = $cursor->format('H:i');
            $slots[] = [
                'time' => $label,
                'available' => ! in_array($label, $taken, true) && ! ($date->isToday() && $cursor->lte(now())),
            ];
            $cursor->addMinutes((int) $schedule->slot_minutes);
        }

        return ApiResponse::ok(['slots' => $slots]);
    }
}
