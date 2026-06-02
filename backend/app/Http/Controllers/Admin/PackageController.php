<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Models\Package;
use App\Models\PackagePurchase;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class PackageController
{
    public function index(): View
    {
        return view('admin.packages.index', [
            'packages' => Package::query()->orderBy('display_order')->orderBy('name')->get(),
        ]);
    }

    public function create(): View
    {
        return view('admin.packages.form', ['package' => new Package]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatePackage($request);

        Package::query()->create([
            'code' => $this->uniqueCode($data['name']),
            'name' => $data['name'],
            'description' => ($data['description'] ?? '') ?: $data['name'],
            'original_price' => $data['price'],
            'discounted_price' => $data['price'],
            'validity_days' => (int) ($data['validity_days'] ?? 365),
            'total_visits' => 1,
            'inclusions' => $this->lines($data['inclusions'] ?? ''),
            'included_test_codes' => [],
            'is_featured' => (bool) $request->input('is_featured', false),
            'is_active' => (bool) $request->input('is_active', true),
            'display_order' => (int) ($data['display_order'] ?? 0),
        ]);

        return redirect()->route('admin.packages.index')->with('status', 'Package added.');
    }

    public function edit(Package $package): View
    {
        return view('admin.packages.form', ['package' => $package]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $data = $this->validatePackage($request);

        $package->update([
            'name' => $data['name'],
            'description' => ($data['description'] ?? '') ?: $data['name'],
            'original_price' => $data['price'],
            'discounted_price' => $data['price'],
            'validity_days' => (int) ($data['validity_days'] ?? 365),
            'inclusions' => $this->lines($data['inclusions'] ?? ''),
            'is_featured' => (bool) $request->input('is_featured', false),
            'is_active' => (bool) $request->input('is_active', false),
            'display_order' => (int) ($data['display_order'] ?? 0),
        ]);

        return redirect()->route('admin.packages.index')->with('status', 'Package updated.');
    }

    public function destroy(Package $package): RedirectResponse
    {
        if ($package->purchases()->exists()) {
            $package->update(['is_active' => false]);

            return redirect()->route('admin.packages.index')
                ->with('status', 'Package has bookings and was hidden instead of deleted.');
        }

        $package->delete();

        return redirect()->route('admin.packages.index')->with('status', 'Package removed.');
    }

    public function bookings(): View
    {
        return view('admin.packages.bookings', [
            'bookings' => PackagePurchase::query()
                ->with(['patient', 'package'])
                ->orderByDesc('created_at')
                ->limit(100)
                ->get(),
        ]);
    }

    public function updateBooking(Request $request, PackagePurchase $purchase): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,completed,cancelled,expired'],
        ]);
        $purchase->update(['status' => $data['status']]);

        return back()->with('status', 'Booking updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePackage(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'price' => ['required', 'numeric', 'min:0', 'max:1000000'],
            'description' => ['nullable', 'string', 'max:2000'],
            'inclusions' => ['nullable', 'string', 'max:4000'],
            'validity_days' => ['nullable', 'integer', 'min:1', 'max:3650'],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:999'],
        ]);
    }

    /**
     * @return array<int, string>
     */
    private function lines(string $text): array
    {
        return collect(preg_split('/\r\n|\r|\n/', $text) ?: [])
            ->map(fn ($l) => trim($l))
            ->filter()
            ->values()
            ->all();
    }

    private function uniqueCode(string $name): string
    {
        $base = 'PKG-'.Str::upper(Str::slug($name));
        $code = $base;
        $i = 1;
        while (Package::query()->where('code', $code)->exists()) {
            $code = $base.'-'.(++$i);
        }

        return $code;
    }
}
