@extends('admin.layout')
@section('title', 'Package bookings')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Package bookings</h1>
    <a href="{{ route('admin.packages.index') }}" class="text-sm text-teal-700">← Manage packages</a>
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Ref</th>
                <th class="px-5 py-2 font-medium">Patient</th>
                <th class="px-5 py-2 font-medium">Package</th>
                <th class="px-5 py-2 font-medium">Amount</th>
                <th class="px-5 py-2 font-medium">Booked</th>
                <th class="px-5 py-2 font-medium">Status</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($bookings as $b)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 text-slate-500">{{ $b->purchase_no }}</td>
                    <td class="px-5 py-3">
                        <a href="{{ route('admin.patients.show', $b->patient_id) }}" class="text-teal-700 font-medium">{{ $b->patient?->name ?? '—' }}</a>
                        <div class="text-slate-400 text-xs">{{ $b->patient?->phone }}</div>
                    </td>
                    <td class="px-5 py-3">{{ $b->package?->name ?? '—' }}</td>
                    <td class="px-5 py-3">LKR {{ number_format((float) $b->amount_paid) }}</td>
                    <td class="px-5 py-3">{{ $b->purchased_at?->format('d M Y') }}</td>
                    <td class="px-5 py-3">
                        <form method="POST" action="{{ route('admin.packages.bookings.update', $b) }}" class="flex gap-2">
                            @csrf @method('PUT')
                            <select name="status" class="rounded-lg border border-slate-300 px-2 py-1 text-xs">
                                @foreach(['active','completed','cancelled','expired'] as $s)
                                    <option value="{{ $s }}" @selected($b->status===$s)>{{ ucfirst($s) }}</option>
                                @endforeach
                            </select>
                            <button class="rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs px-3">Save</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-6 text-center text-slate-400">No package bookings yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
