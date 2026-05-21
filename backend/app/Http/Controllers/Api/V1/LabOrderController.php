<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CreateLabOrderRequest;
use App\Http\Resources\LabOrderResource;
use App\Models\LabOrder;
use App\Models\Patient;
use App\Services\LabOrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LabOrderController
{
    public function __construct(private LabOrderService $service) {}

    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $status = (string) $request->query('status', 'all');
        $query = $patient->labOrders()->with('items.test')->orderByDesc('created_at');
        if (in_array($status, ['ordered', 'sample_collected', 'processing', 'ready', 'delivered'], true)) {
            $query->where('status', $status);
        }

        return ApiResponse::ok(LabOrderResource::collection($query->get())->resolve());
    }

    public function show(Request $request, LabOrder $order): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        abort_if($order->patient_id !== $patient->id, 404, 'Order not found.');
        $order->load('items.test');

        return ApiResponse::ok((new LabOrderResource($order))->resolve());
    }

    public function store(CreateLabOrderRequest $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        $order = $this->service->create(
            $patient,
            $request->validated('test_ids'),
            (string) $request->validated('collection_type')
        );

        return ApiResponse::ok((new LabOrderResource($order))->resolve(), 'Lab order created.', 201);
    }
}
