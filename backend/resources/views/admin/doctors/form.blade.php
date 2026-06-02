@extends('admin.layout')
@section('title', $doctor->exists ? 'Edit doctor' : 'Add doctor')
@section('content')
@php($isEdit = $doctor->exists)
<div class="mb-6">
    <a href="{{ route('admin.doctors.index') }}" class="text-sm text-teal-700">← Doctors</a>
    <h1 class="mt-1 text-2xl font-semibold text-slate-900">{{ $isEdit ? 'Edit doctor' : 'Add doctor' }}</h1>
</div>

<form method="POST"
      action="{{ $isEdit ? route('admin.doctors.update', $doctor) : route('admin.doctors.store') }}"
      enctype="multipart/form-data"
      class="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4">
    @csrf
    @if($isEdit) @method('PUT') @endif

    <div class="flex items-center gap-4">
        @if($doctor->avatar_path)
            <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($doctor->avatar_path) }}" class="w-16 h-16 rounded-full object-cover" alt="">
        @else
            <div class="w-16 h-16 rounded-full bg-teal-100 text-teal-700 grid place-items-center text-xl">＋</div>
        @endif
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Photo (optional)</label>
            <input name="photo" type="file" accept="image/*" class="text-sm">
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input name="name" value="{{ old('name', $doctor->name) }}" required placeholder="Dr. ..." class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Specialization *</label>
            <input name="specialization" value="{{ old('specialization', $doctor->specialization) }}" required placeholder="Cardiologist" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Qualifications *</label>
            <input name="qualifications" value="{{ old('qualifications', $doctor->qualifications) }}" required placeholder="MBBS, MD (Cardiology)" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea name="bio" rows="3" class="w-full rounded-lg border border-slate-300 px-3 py-2">{{ old('bio', $doctor->bio) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Consultation fee (LKR) *</label>
            <input name="consultation_fee" type="number" step="0.01" value="{{ old('consultation_fee', $doctor->consultation_fee ?? 2500) }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Display order</label>
            <input name="display_order" type="number" value="{{ old('display_order', $doctor->display_order ?? 1) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Languages</label>
            @php($langs = old('languages', $doctor->languages ?? ['en']))
            <div class="flex gap-4 mt-1">
                @foreach(['en' => 'English', 'si' => 'Sinhala', 'ta' => 'Tamil'] as $code => $label)
                    <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                        <input type="checkbox" name="languages[]" value="{{ $code }}" @checked(in_array($code, (array) $langs, true)) class="rounded border-slate-300">
                        {{ $label }}
                    </label>
                @endforeach
            </div>
        </div>
        <div class="sm:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="hidden" name="is_active" value="0">
                <input type="checkbox" name="is_active" value="1" @checked(old('is_active', $doctor->is_active ?? true)) class="rounded border-slate-300">
                Visible in the app
            </label>
        </div>
    </div>

    @unless($isEdit)
        <p class="text-xs text-slate-400">A default daily schedule (8:00 AM–9:00 PM, 15-min slots) is created so patients can book right away.</p>
    @endunless

    <button class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium px-6 py-2.5">{{ $isEdit ? 'Save changes' : 'Add doctor' }}</button>
</form>
@endsection
