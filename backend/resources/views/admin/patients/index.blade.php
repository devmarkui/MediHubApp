@extends('admin.layout')
@section('title', 'Patients')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Patients</h1>
    <a href="{{ route('admin.patients.create') }}" class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2">+ New patient</a>
</div>

<form method="GET" action="{{ route('admin.patients.index') }}" class="mb-5 flex gap-2">
    <input name="q" value="{{ $term }}" placeholder="Search by mobile number, name or passbook no…"
           class="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none">
    <button class="rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5">Search</button>
</form>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Name</th>
                <th class="px-5 py-2 font-medium">Mobile</th>
                <th class="px-5 py-2 font-medium">Passbook</th>
                <th class="px-5 py-2 font-medium">Reports</th>
                <th class="px-5 py-2"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($patients as $p)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium text-slate-900">{{ $p->name }}</td>
                    <td class="px-5 py-3">{{ $p->phone }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ $p->passbook_no }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ $p->reports()->count() }}</td>
                    <td class="px-5 py-3 text-right">
                        <a href="{{ route('admin.patients.show', $p) }}" class="text-teal-700 font-medium">Open →</a>
                    </td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-5 py-6 text-center text-slate-400">
                    @if($term !== '') No patients match “{{ $term }}”. @else No patients yet. @endif
                </td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
