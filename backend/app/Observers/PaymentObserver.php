<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Payment;
use App\Services\SerialNumberService;

class PaymentObserver
{
    public function __construct(private SerialNumberService $serials) {}

    public function creating(Payment $payment): void
    {
        if (empty($payment->payment_no)) {
            $payment->payment_no = $this->serials->next('PAY');
        }
    }
}
