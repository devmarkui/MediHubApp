@extends('admin.layout')
@section('title', 'Appointments')
@section('content')
<h1 class="text-2xl font-semibold text-slate-900 mb-4">Appointment requests</h1>

<div class="mb-5 flex flex-wrap gap-2 text-sm">
    @foreach(['all'=>'All','pending'=>'Pending','confirmed'=>'Confirmed','completed'=>'Completed','cancelled'=>'Cancelled'] as $key => $label)
        <a href="{{ route('admin.appointments.index', ['status' => $key]) }}"
           class="px-3 py-1.5 rounded-full border {{ $status === $key ? 'bg-teal-700 text-white border-teal-700' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-600' }}">{{ $label }}</a>
    @endforeach
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Ref</th>
                <th class="px-5 py-2 font-medium">Patient</th>
                <th class="px-5 py-2 font-medium">Doctor</th>
                <th class="px-5 py-2 font-medium">When</th>
                <th class="px-5 py-2 font-medium">Status</th>
                <th class="px-5 py-2 font-medium">Update</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($appointments as $a)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 text-slate-500">{{ $a->appointment_no }}</td>
                    <td class="px-5 py-3">
                        <a href="{{ route('admin.patients.show', $a->patient_id) }}" class="text-teal-700 font-medium">{{ $a->patient?->name ?? '—' }}</a>
                        <div class="text-slate-400 text-xs">{{ $a->patient?->phone }}</div>
                    </td>
                    <td class="px-5 py-3">{{ $a->doctor?->name ?? '—' }}<div class="text-slate-400 text-xs">{{ $a->doctor?->specialization }}</div></td>
                    <td class="px-5 py-3">{{ $a->appointment_date?->format('d M Y') }} · {{ \Illuminate\Support\Str::of($a->appointment_time)->substr(0,5) }}</td>
                    <td class="px-5 py-3">@include('admin.partials.status', ['status' => $a->status])</td>
                    <td class="px-5 py-3">
                        <form method="POST" action="{{ route('admin.appointments.update', $a) }}" class="flex gap-2">
                            @csrf @method('PUT')
                            <select name="status" class="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                                @foreach(['pending','confirmed','completed','cancelled','no_show'] as $s)
                                    <option value="{{ $s }}" @selected($a->status===$s)>{{ ucfirst(str_replace('_',' ',$s)) }}</option>
                                @endforeach
                            </select>
                            <button class="rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs px-3">Save</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-6 text-center text-slate-400">No appointment requests.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
