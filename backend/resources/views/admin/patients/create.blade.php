@extends('admin.layout')
@section('title', 'New patient')
@section('content')
<div class="mb-6">
    <a href="{{ route('admin.patients.index') }}" class="text-sm text-teal-700">← Patients</a>
    <h1 class="mt-1 text-2xl font-semibold text-slate-900">New patient</h1>
</div>

<form method="POST" action="{{ route('admin.patients.store') }}" class="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4">
    @csrf
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
            <input name="name" value="{{ old('name') }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Mobile (+9477XXXXXXX) *</label>
            <input name="phone" value="{{ old('phone') }}" placeholder="+94771234567" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Temporary password</label>
            <input name="password" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="min 6 chars (optional)">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" value="{{ old('email') }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Date of birth</label>
            <input name="dob" type="date" value="{{ old('dob') }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select name="gender" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">—</option>
                @foreach(['male','female','other'] as $g)
                    <option value="{{ $g }}" @selected(old('gender')===$g)>{{ ucfirst($g) }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Blood group</label>
            <select name="blood_group" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">—</option>
                @foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $bg)
                    <option value="{{ $bg }}" @selected(old('blood_group')===$bg)>{{ $bg }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
            <input name="height_cm" type="number" step="0.1" value="{{ old('height_cm') }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
            <input name="weight_kg" type="number" step="0.1" value="{{ old('weight_kg') }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
    </div>
    <div class="pt-2">
        <button class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium px-6 py-2.5">Create patient</button>
    </div>
</form>
@endsection
