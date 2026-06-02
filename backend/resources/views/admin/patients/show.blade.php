@extends('admin.layout')
@section('title', $patient->name)
@section('content')
<div class="mb-6">
    <a href="{{ route('admin.patients.index') }}" class="text-sm text-teal-700">← Patients</a>
    <div class="mt-1 flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-semibold text-slate-900">{{ $patient->name }}</h1>
            <p class="text-slate-500">{{ $patient->phone }} · {{ $patient->passbook_no }}</p>
        </div>
        <div class="text-right">
            <span class="text-sm text-slate-500">BMI</span>
            <p class="text-2xl font-semibold text-teal-700">{{ $patient->bmi() ?? '—' }}</p>
        </div>
    </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {{-- Details + BMI --}}
    <div class="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 class="font-medium text-slate-900 mb-4">Patient details</h2>
        <form method="POST" action="{{ route('admin.patients.update', $patient) }}" class="space-y-4">
            @csrf
            @method('PUT')
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
                    <input name="name" value="{{ old('name', $patient->name) }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div class="col-span-2">
                    <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input name="email" type="email" value="{{ old('email', $patient->email) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Date of birth</label>
                    <input name="dob" type="date" value="{{ old('dob', optional($patient->dob)->format('Y-m-d')) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                        <option value="">—</option>
                        @foreach(['male','female','other'] as $g)
                            <option value="{{ $g }}" @selected(old('gender', $patient->gender)===$g)>{{ ucfirst($g) }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Blood group</label>
                    <select name="blood_group" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                        <option value="">—</option>
                        @foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $bg)
                            <option value="{{ $bg }}" @selected(old('blood_group', $patient->blood_group)===$bg)>{{ $bg }}</option>
                        @endforeach
                    </select>
                </div>
                <div></div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input name="height_cm" type="number" step="0.1" value="{{ old('height_cm', $patient->height_cm) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input name="weight_kg" type="number" step="0.1" value="{{ old('weight_kg', $patient->weight_kg) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Reset password</label>
                    <input name="password" type="text" placeholder="leave blank to keep" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div class="flex items-end">
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input type="hidden" name="is_active" value="0">
                        <input type="checkbox" name="is_active" value="1" @checked($patient->is_active) class="rounded border-slate-300">
                        Account active
                    </label>
                </div>
            </div>
            <button class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium px-6 py-2.5">Save details</button>
        </form>
    </div>

    {{-- Reports (EMR) --}}
    <div class="space-y-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 class="font-medium text-slate-900 mb-4">Upload report</h2>
            <form method="POST" action="{{ route('admin.reports.store', $patient) }}" enctype="multipart/form-data" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                    <input name="title" required placeholder="e.g. Full Blood Count" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                        <select name="report_type" class="w-full rounded-lg border border-slate-300 px-3 py-2">
                            @foreach(['lab','consultation','prescription','imaging'] as $rt)
                                <option value="{{ $rt }}">{{ ucfirst($rt) }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">File (PDF/JPG/PNG) *</label>
                        <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required class="w-full text-sm">
                    </div>
                </div>
                <button class="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5">Upload</button>
            </form>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div class="px-5 py-3 border-b border-slate-100"><h2 class="font-medium text-slate-900">Reports ({{ $patient->reports->count() }})</h2></div>
            <ul class="divide-y divide-slate-100">
                @forelse($patient->reports as $r)
                    <li class="px-5 py-3 flex items-center justify-between">
                        <div>
                            <p class="font-medium text-slate-900">{{ $r->title }}</p>
                            <p class="text-xs text-slate-400">{{ ucfirst($r->report_type) }} · {{ $r->released_at?->format('d M Y') }} · {{ $r->file_size_kb }} KB</p>
                        </div>
                        <form method="POST" action="{{ route('admin.reports.destroy', [$patient, $r]) }}" onsubmit="return confirm('Remove this report?')">
                            @csrf @method('DELETE')
                            <button class="text-sm text-red-600 hover:underline">Remove</button>
                        </form>
                    </li>
                @empty
                    <li class="px-5 py-6 text-center text-slate-400 text-sm">No reports uploaded yet.</li>
                @endforelse
            </ul>
        </div>
    </div>
</div>
@endsection
