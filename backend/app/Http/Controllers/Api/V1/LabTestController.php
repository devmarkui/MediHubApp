<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\LabTestResource;
use App\Models\LabTest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabTestController
{
    public function index(Request $request): JsonResponse
    {
        $query = LabTest::query()->where('is_active', true)->orderBy('category')->orderBy('name');

        $category = $request->query('category');
        if (is_string($category) && $category !== '') {
            $query->where('category', $category);
        }

        return ApiResponse::ok(LabTestResource::collection($query->get())->resolve());
    }
}
