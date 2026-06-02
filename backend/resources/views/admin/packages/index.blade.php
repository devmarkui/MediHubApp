@extends('admin.layout')
@section('title', 'Packages')
@section('content')
<div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-semibold text-slate-900">Health checkup packages</h1>
    <div class="flex gap-2">
        <a href="{{ route('admin.packages.bookings') }}" class="rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2">Bookings</a>
        <a href="{{ route('admin.packages.create') }}" class="rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium px-4 py-2">+ Add package</a>
    </div>
</div>

<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <table class="w-full text-sm">
        <thead class="text-left text-slate-500 bg-slate-50">
            <tr>
                <th class="px-5 py-2 font-medium">Package</th>
                <th class="px-5 py-2 font-medium">Price</th>
                <th class="px-5 py-2 font-medium">Tests</th>
                <th class="px-5 py-2 font-medium">Order</th>
                <th class="px-5 py-2 font-medium">Status</th>
                <th class="px-5 py-2"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($packages as $p)
                <tr class="hover:bg-slate-50">
                    <td class="px-5 py-3 font-medium text-slate-900">
                        {{ $p->name }}
                        @if($p->is_featured)<span class="ml-2 inline-block rounded-full px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700">Popular</span>@endif
                    </td>
                    <td class="px-5 py-3">LKR {{ number_format((float) $p->discounted_price) }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ count($p->inclusions ?? []) }}</td>
                    <td class="px-5 py-3 text-slate-500">{{ $p->display_order }}</td>
                    <td class="px-5 py-3">
                        @if($p->is_active)
                            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                        @else
                            <span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">Hidden</span>
                        @endif
                    </td>
                    <td class="px-5 py-3 text-right whitespace-nowrap">
                        <a href="{{ route('admin.packages.edit', $p) }}" class="text-teal-700 font-medium">Edit</a>
                        <form method="POST" action="{{ route('admin.packages.destroy', $p) }}" class="inline ml-3" onsubmit="return confirm('Remove this package? (Packages with bookings are hidden instead.)')">
                            @csrf @method('DELETE')
                            <button class="text-red-600">Remove</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6" class="px-5 py-6 text-center text-slate-400">No packages yet.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@endsection
