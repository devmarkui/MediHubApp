<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\PackageResource;
use App\Models\Package;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::query()->where('is_active', true)->orderBy('display_order');
        if ((string) $request->query('featured', '') === '1') {
            $query->where('is_featured', true);
        }

        return ApiResponse::ok(PackageResource::collection($query->get())->resolve());
    }

    public function show(Package $package): JsonResponse
    {
        abort_if(! $package->is_active, 404, 'Package not found.');

        return ApiResponse::ok((new PackageResource($package))->resolve());
    }
}
