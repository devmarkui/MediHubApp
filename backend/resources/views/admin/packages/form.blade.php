@extends('admin.layout')
@section('title', $package->exists ? 'Edit package' : 'Add package')
@section('content')
@php($isEdit = $package->exists)
<div class="mb-6">
    <a href="{{ route('admin.packages.index') }}" class="text-sm text-teal-700">← Packages</a>
    <h1 class="mt-1 text-2xl font-semibold text-slate-900">{{ $isEdit ? 'Edit package' : 'Add package' }}</h1>
</div>

<form method="POST"
      action="{{ $isEdit ? route('admin.packages.update', $package) : route('admin.packages.store') }}"
      class="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl space-y-4">
    @csrf
    @if($isEdit) @method('PUT') @endif

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Package name *</label>
            <input name="name" value="{{ old('name', $package->name) }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Price (LKR) *</label>
            <input name="price" type="number" step="0.01" value="{{ old('price', $package->discounted_price ?? 2600) }}" required class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Validity (days)</label>
            <input name="validity_days" type="number" value="{{ old('validity_days', $package->validity_days ?? 365) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Inclusions (one test per line)</label>
            <textarea name="inclusions" rows="6" placeholder="Full Blood Count&#10;Fasting Blood Sugar&#10;Lipid Profile" class="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm">{{ old('inclusions', is_array($package->inclusions) ? implode("\n", $package->inclusions) : '') }}</textarea>
        </div>
        <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Description / notes</label>
            <textarea name="description" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2">{{ old('description', $package->description) }}</textarea>
        </div>
        <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Display order</label>
            <input name="display_order" type="number" value="{{ old('display_order', $package->display_order ?? 0) }}" class="w-full rounded-lg border border-slate-300 px-3 py-2">
        </div>
        <div class="flex items-end gap-6">
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="hidden" name="is_featured" value="0">
                <input type="checkbox" name="is_featured" value="1" @checked(old('is_featured', $package->is_featured ?? false)) class="rounded border-slate-300"> Popular
            </label>
            <label class="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="hidden" name="is_active" value="0">
                <input type="checkbox" name="is_active" value="1" @checked(old('is_active', $package->is_active ?? true)) class="rounded border-slate-300"> Visible in app
            </label>
        </div>
    </div>

    <button class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium px-6 py-2.5">{{ $isEdit ? 'Save changes' : 'Add package' }}</button>
</form>
@endsection
