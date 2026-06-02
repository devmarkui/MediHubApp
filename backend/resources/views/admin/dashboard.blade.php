@extends('admin.layout')
@section('title', 'Dashboard')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Welcome, {{ session('admin_name') }}</h1>
    <a href="{{ route('admin.patients.create') }}" class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2">+ New patient</a>
</div>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-sm text-slate-500">Patients</p>
        <p class="mt-1 text-3xl font-semibold text-slate-900">{{ $patientCount }}</p>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200 p-5">
        <p class="text-sm text-slate-500">Reports uploaded</p>
        <p class="mt-1 text-3xl font-semibold text-slate-900">{{ $reportCount }}</p>
    </div>
    <a href="{{ route('admin.appointments.index', ['status' => 'pending']) }}" class="bg-white rounded-2xl border border-slate-200 p-5 hover:border-teal-600 transition">
        <p class="text-sm text-slate-500">Pending appointment requests</p>
        <p class="mt-1 text-3xl font-semibold text-emerald-600">{{ $pendingAppointments }}</p>
    </a>
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <div class="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-medium text-slate-900">Recent appointment requests</h2>
        <a href="{{ route('admin.appointments.index') }}" class="text-sm text-teal-700">View all →</a>
    </div>
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Patient</th>
                <th class="px-5 py-2 font-medium">Doctor</th>
                <th class="px-5 py-2 font-medium">When</th>
                <th class="px-5 py-2 font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($recentAppointments as $a)
                <tr>
                    <td class="px-5 py-3">
                        <a href="{{ route('admin.patients.show', $a->patient_id) }}" class="text-teal-700 font-medium">{{ $a->patient?->name ?? '—' }}</a>
                        <div class="text-slate-400 text-xs">{{ $a->patient?->phone }}</div>
                    </td>
                    <td class="px-5 py-3">{{ $a->doctor?->name ?? '—' }}</td>
                    <td class="px-5 py-3">{{ $a->appointment_date?->format('d M Y') }} · {{ \Illuminate\Support\Str::of($a->appointment_time)->substr(0,5) }}</td>
                    <td class="px-5 py-3">@include('admin.partials.status', ['status' => $a->status])</td>
                </tr>
            @empty
                <tr><td colspan="4" class="px-5 py-6 text-center text-slate-400">No appointment requests yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
