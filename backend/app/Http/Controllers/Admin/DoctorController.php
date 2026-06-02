<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class DoctorController
{
    public function index(): View
    {
        return view('admin.doctors.index', [
            'doctors' => Doctor::query()->orderBy('display_order')->orderBy('name')->get(),
        ]);
    }

    public function create(): View
    {
        return view('admin.doctors.form', ['doctor' => new Doctor]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateDoctor($request);

        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['languages'] = $request->input('languages', []);
        $data['is_active'] = (bool) $request->input('is_active', true);
        $data['display_order'] = (int) ($data['display_order'] ?? 0);

        if ($request->hasFile('photo')) {
            $data['avatar_path'] = $request->file('photo')->store('doctors', 'public');
        }
        unset($data['photo']);

        $doctor = Doctor::query()->create($data);
        $this->ensureDefaultSchedule($doctor);

        return redirect()->route('admin.doctors.index')->with('status', 'Doctor added.');
    }

    public function edit(Doctor $doctor): View
    {
        return view('admin.doctors.form', ['doctor' => $doctor]);
    }

    public function update(Request $request, Doctor $doctor): RedirectResponse
    {
        $data = $this->validateDoctor($request);
        $data['languages'] = $request->input('languages', []);
        $data['is_active'] = (bool) $request->input('is_active', false);
        $data['display_order'] = (int) ($data['display_order'] ?? 0);

        if ($request->hasFile('photo')) {
            if ($doctor->avatar_path && Storage::disk('public')->exists($doctor->avatar_path)) {
                Storage::disk('public')->delete($doctor->avatar_path);
            }
            $data['avatar_path'] = $request->file('photo')->store('doctors', 'public');
        }
        unset($data['photo']);

        $doctor->update($data);

        return redirect()->route('admin.doctors.index')->with('status', 'Doctor updated.');
    }

    public function destroy(Doctor $doctor): RedirectResponse
    {
        // Doctors with appointments cannot be deleted (FK restrict) — deactivate instead.
        if ($doctor->appointments()->exists()) {
            $doctor->update(['is_active' => false]);

            return redirect()->route('admin.doctors.index')
                ->with('status', 'Doctor has appointments and was deactivated instead of deleted.');
        }

        if ($doctor->avatar_path && Storage::disk('public')->exists($doctor->avatar_path)) {
            Storage::disk('public')->delete($doctor->avatar_path);
        }
        $doctor->schedules()->delete();
        $doctor->delete();

        return redirect()->route('admin.doctors.index')->with('status', 'Doctor removed.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateDoctor(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'specialization' => ['required', 'string', 'max:120'],
            'qualifications' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'consultation_fee' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 1;
        while (Doctor::query()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }

    /**
     * Give a new doctor a default weekly schedule aligned with clinic hours
     * (every day, 8:00 AM–9:00 PM, 15-minute slots) so booking works immediately.
     */
    private function ensureDefaultSchedule(Doctor $doctor): void
    {
        foreach (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as $day) {
            DoctorSchedule::query()->create([
                'doctor_id' => $doctor->id,
                'day_of_week' => $day,
                'start_time' => '08:00:00',
                'end_time' => '21:00:00',
                'slot_minutes' => 15,
                'max_patients' => 20,
                'is_active' => true,
            ]);
        }
    }
}
