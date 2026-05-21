<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\PackagePurchase;
use App\Services\SerialNumberService;

class PackagePurchaseObserver
{
    public function __construct(private SerialNumberService $serials) {}

    public function creating(PackagePurchase $purchase): void
    {
        if (empty($purchase->purchase_no)) {
            $purchase->purchase_no = $this->serials->next('PKG');
        }
        if (empty($purchase->purchased_at)) {
            $purchase->purchased_at = now();
        }
    }
}
