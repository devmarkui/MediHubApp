<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PatientController
{
    /**
     * Search patients by mobile number (or name).
     */
    public function index(Request $request): View
    {
        $term = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->when($term !== '', function ($query) use ($term) {
                $digits = preg_replace('/\D/', '', $term);
                $query->where('name', 'like', "%{$term}%")
                    ->when($digits !== '', fn ($q) => $q->orWhere('phone', 'like', "%{$digits}%"))
                    ->orWhere('passbook_no', 'like', "%{$term}%");
            })
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return view('admin.patients.index', [
            'patients' => $patients,
            'term' => $term,
        ]);
    }

    public function create(): View
    {
        return view('admin.patients.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'nic' => ['nullable', 'string', 'max:20'],
            'phone' => ['required', 'string', 'regex:/^\+947\d{8}$/', 'unique:patients,phone'],
            'password' => ['nullable', 'string', 'min:6', 'max:72'],
            'email' => ['nullable', 'email', 'max:160'],
            'address' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:60'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'blood_group' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'height_cm' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'weight_kg' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'allergies' => ['nullable', 'string', 'max:2000'],
            'chronic_conditions' => ['nullable', 'string', 'max:2000'],
            'current_medications' => ['nullable', 'string', 'max:2000'],
            'past_surgeries' => ['nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:120'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
        ], [
            'phone.regex' => 'Phone must look like +9477XXXXXXX.',
        ]);

        // The Patient model hashes the password via its 'hashed' cast.
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $patient = Patient::query()->create($data);

        return redirect()
            ->route('admin.patients.show', $patient)
            ->with('status', 'Patient created.');
    }

    public function show(Patient $patient): View
    {
        $patient->load(['reports' => fn ($q) => $q->orderByDesc('released_at')]);

        return view('admin.patients.show', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, Patient $patient): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'nic' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:160'],
            'address' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:60'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'dob' => ['nullable', 'date', 'before:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'blood_group' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'height_cm' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'weight_kg' => ['nullable', 'numeric', 'min:1', 'max:500'],
            'allergies' => ['nullable', 'string', 'max:2000'],
            'chronic_conditions' => ['nullable', 'string', 'max:2000'],
            'current_medications' => ['nullable', 'string', 'max:2000'],
            'past_surgeries' => ['nullable', 'string', 'max:2000'],
            'emergency_contact_name' => ['nullable', 'string', 'max:120'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6', 'max:72'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $patient->fill([
            'name' => $data['name'],
            'nic' => $data['nic'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'district' => $data['district'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'dob' => $data['dob'] ?? null,
            'gender' => $data['gender'] ?? null,
            'blood_group' => $data['blood_group'] ?? null,
            'height_cm' => $data['height_cm'] ?? null,
            'weight_kg' => $data['weight_kg'] ?? null,
            'allergies' => $data['allergies'] ?? null,
            'chronic_conditions' => $data['chronic_conditions'] ?? null,
            'current_medications' => $data['current_medications'] ?? null,
            'past_surgeries' => $data['past_surgeries'] ?? null,
            'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? false),
        ]);

        if (! empty($data['password'])) {
            // 'hashed' cast on the model hashes this on save.
            $patient->password = $data['password'];
        }

        $patient->save();

        return redirect()
            ->route('admin.patients.show', $patient)
            ->with('status', 'Patient details updated.');
    }
}
