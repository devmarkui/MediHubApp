<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\LabOrder;
use App\Services\SerialNumberService;

class LabOrderObserver
{
    public function __construct(private SerialNumberService $serials) {}

    public function creating(LabOrder $order): void
    {
        if (empty($order->order_no)) {
            $order->order_no = $this->serials->next('LAB');
        }
        if (empty($order->ordered_at)) {
            $order->ordered_at = now();
        }
    }
}
