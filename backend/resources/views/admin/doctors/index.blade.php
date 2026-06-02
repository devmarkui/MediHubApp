@extends('admin.layout')
@section('title', 'Doctors')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Doctors</h1>
    <a href="{{ route('admin.doctors.create') }}" class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2">+ Add doctor</a>
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Doctor</th>
                <th class="px-5 py-2 font-medium">Specialization</th>
                <th class="px-5 py-2 font-medium">Fee</th>
                <th class="px-5 py-2 font-medium">Order</th>
                <th class="px-5 py-2 font-medium">Status</th>
                <th class="px-5 py-2"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($doctors as $d)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3">
                        <div class="flex items-center gap-3">
                            @if($d->avatar_path)
                                <img src="{{ \Illuminate\Support\Facades\Storage::disk('public')->url($d->avatar_path) }}" class="w-9 h-9 rounded-full object-cover" alt="">
                            @else
                                <div class="w-9 h-9 rounded-full bg-teal-100 text-teal-700 grid place-items-center font-medium">{{ \Illuminate\Support\Str::of($d->name)->explode(' ')->map(fn($p)=>\Illuminate\Support\Str::substr($p,0,1))->take(2)->implode('') }}</div>
                            @endif
                            <span class="font-medium text-slate-900">{{ $d->name }}</span>
                        </div>
                    </td>
                    <td class="px-5 py-3">{{ $d->specialization }}</td>
                    <td class="px-5 py-3">LKR {{ number_format((float) $d->consultation_fee) }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ $d->display_order }}</td>
                    <td class="px-5 py-3">
                        @if($d->is_active)
                            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                        @else
                            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">Hidden</span>
                        @endif
                    </td>
                    <td class="px-5 py-3 text-right whitespace-nowrap">
                        <a href="{{ route('admin.doctors.edit', $d) }}" class="text-teal-700 font-medium">Edit</a>
                        <form method="POST" action="{{ route('admin.doctors.destroy', $d) }}" class="inline ml-3" onsubmit="return confirm('Remove this doctor? (Doctors with appointments are deactivated instead.)')">
                            @csrf @method('DELETE')
                            <button class="text-red-600">Remove</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-6 text-center text-slate-400">No doctors yet. Add your first specialist.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
