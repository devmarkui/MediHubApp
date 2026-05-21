<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\LabOrder;
use App\Models\LabOrderItem;
use App\Models\LabTest;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

class LabOrderService
{
    /**
     * Create a lab order with its items, computing the total server-side from the
     * authoritative price list (clients cannot influence pricing).
     *
     * @param  array<int>  $testIds
     */
    public function create(Patient $patient, array $testIds, string $collectionType): LabOrder
    {
        return DB::transaction(function () use ($patient, $testIds, $collectionType): LabOrder {
            $tests = LabTest::query()->whereIn('id', $testIds)->where('is_active', true)->get();
            abort_if($tests->isEmpty(), 422, 'No active tests in the request.');

            $total = (float) $tests->sum('price');

            $order = LabOrder::query()->create([
                'patient_id' => $patient->id,
                'total_amount' => $total,
                'payment_status' => 'unpaid',
                'status' => 'ordered',
                'collection_type' => $collectionType,
            ]);

            foreach ($tests as $test) {
                LabOrderItem::query()->create([
                    'lab_order_id' => $order->id,
                    'lab_test_id' => $test->id,
                    'price' => $test->price,
                ]);
            }

            return $order->load('items.test');
        });
    }
}
