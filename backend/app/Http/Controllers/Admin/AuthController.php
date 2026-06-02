<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Admin;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class AuthController
{
    public function showLogin(): View|RedirectResponse
    {
        if (request()->session()->has('admin_id')) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login');
    }

    public function login(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::query()->where('email', $data['email'])->first();

        if ($admin === null || ! Hash::check($data['password'], $admin->password)) {
            return back()->withErrors(['email' => 'Incorrect email or password.'])->onlyInput('email');
        }

        $request->session()->regenerate();
        $request->session()->put('admin_id', $admin->id);
        $request->session()->put('admin_name', $admin->name);

        return redirect()->route('admin.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget(['admin_id', 'admin_name']);
        $request->session()->regenerate();

        return redirect()->route('admin.login');
    }
}
