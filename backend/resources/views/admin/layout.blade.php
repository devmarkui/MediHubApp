<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>MediHub Admin · @yield('title', 'Dashboard')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { theme: { extend: { colors: {
            teal: { 600: '#0d7d7d', 700: '#0a6363' },
            emerald: { 500: '#10b981' },
        } } } }
    </script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen">
@php($isAuthed = session()->has('admin_id'))
@if($isAuthed)
<header class="bg-teal-700 text-white">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="{{ route('admin.dashboard') }}" class="font-semibold text-lg flex items-center gap-2">
            <span class="inline-block w-7 h-7 rounded-lg bg-white/20 grid place-items-center">＋</span>
            MediHub Admin
        </a>
        <nav class="flex items-center gap-1 text-sm">
            <a href="{{ route('admin.dashboard') }}" class="px-3 py-1.5 rounded hover:bg-white/10 {{ request()->routeIs('admin.dashboard') ? 'bg-white/15' : '' }}">Dashboard</a>
            <a href="{{ route('admin.patients.index') }}" class="px-3 py-1.5 rounded hover:bg-white/10 {{ request()->routeIs('admin.patients.*') ? 'bg-white/15' : '' }}">Patients</a>
            <a href="{{ route('admin.doctors.index') }}" class="px-3 py-1.5 rounded hover:bg-white/10 {{ request()->routeIs('admin.doctors.*') ? 'bg-white/15' : '' }}">Doctors</a>
            <a href="{{ route('admin.packages.index') }}" class="px-3 py-1.5 rounded hover:bg-white/10 {{ request()->routeIs('admin.packages.*') ? 'bg-white/15' : '' }}">Packages</a>
            <a href="{{ route('admin.appointments.index') }}" class="px-3 py-1.5 rounded hover:bg-white/10 {{ request()->routeIs('admin.appointments.*') ? 'bg-white/15' : '' }}">Appointments</a>
            <form method="POST" action="{{ route('admin.logout') }}" class="ml-2">
                @csrf
                <button class="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20">Sign out</button>
            </form>
        </nav>
    </div>
</header>
@endif

<main class="max-w-6xl mx-auto px-4 py-6">
    @if(session('status'))
        <div class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">
            {{ session('status') }}
        </div>
    @endif
    @if($errors->any())
        <div class="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            <ul class="list-disc list-inside">
                @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
            </ul>
        </div>
    @endif
    @yield('content')
</main>
</body>
</html>
