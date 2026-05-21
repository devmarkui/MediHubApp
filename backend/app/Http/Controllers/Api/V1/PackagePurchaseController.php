<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CreatePackagePurchaseRequest;
use App\Http\Resources\PackagePurchaseResource;
use App\Models\Package;
use App\Models\PackagePurchase;
use App\Models\Patient;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackagePurchaseController
{
    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $purchases = $patient->packagePurchases()->with('package')->orderByDesc('created_at')->get();

        return ApiResponse::ok(PackagePurchaseResource::collection($purchases)->resolve());
    }

    public function store(CreatePackagePurchaseRequest $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        $package = Package::query()->findOrFail((int) $request->validated('package_id'));
        abort_if(! $package->is_active, 422, 'Package is not available.');

        $purchase = PackagePurchase::query()->create([
            'patient_id' => $patient->id,
            'package_id' => $package->id,
            'amount_paid' => $package->discounted_price,
            'expires_at' => now()->addDays($package->validity_days),
            'visits_used' => 0,
            'visits_total' => $package->total_visits,
            'status' => 'active',
        ]);

        $purchase->load('package');

        return ApiResponse::ok((new PackagePurchaseResource($purchase))->resolve(), 'Package purchase created.', 201);
    }
}
