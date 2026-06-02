@extends('admin.layout')
@section('title', 'Sign in')
@section('content')
<div class="min-h-[70vh] grid place-items-center">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div class="text-center mb-6">
            <div class="mx-auto w-12 h-12 rounded-xl bg-teal-700 text-white grid place-items-center text-2xl">＋</div>
            <h1 class="mt-3 text-xl font-semibold text-slate-900">MediHub Admin</h1>
            <p class="text-sm text-slate-500">Sign in to manage patients & reports</p>
        </div>
        <form method="POST" action="{{ route('admin.login.submit') }}" class="space-y-4">
            @csrf
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" value="{{ old('email') }}" required autofocus
                       class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input name="password" type="password" required
                       class="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none">
            </div>
            <button class="w-full rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-medium py-2.5">Sign in</button>
        </form>
    </div>
</div>
@endsection
