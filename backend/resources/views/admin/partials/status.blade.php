@php
    $map = [
        'pending'   => 'bg-amber-100 text-amber-700',
        'confirmed' => 'bg-emerald-100 text-emerald-700',
        'completed' => 'bg-slate-100 text-slate-600',
        'cancelled' => 'bg-red-100 text-red-700',
        'no_show'   => 'bg-red-100 text-red-700',
    ];
    $cls = $map[$status] ?? 'bg-slate-100 text-slate-600';
@endphp
<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium {{ $cls }}">{{ ucfirst(str_replace('_',' ',$status)) }}</span>
