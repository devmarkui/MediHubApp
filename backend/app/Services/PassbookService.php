<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\PackagePurchase;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PassbookService
{
    /**
     * Build a unified passbook feed across appointments, lab orders, and package
     * purchases, ordered by created_at desc, paginated manually.
     */
    public function feed(int $patientId, string $type, int $page, int $perPage): LengthAwarePaginator
    {
        $entries = new Collection;

        if ($type === 'all' || $type === 'consultation') {
            Appointment::query()
                ->with('doctor')
                ->where('patient_id', $patientId)
                ->get()
                ->each(function (Appointment $a) use ($entries) {
                    $entries->push([
                        'id' => 'apt-'.$a->id,
                        'type' => 'consultation',
                        'title' => 'Doctor visit',
                        'subtitle' => $a->doctor?->name ?? 'Consultation',
                        'amount' => (float) $a->consultation_fee,
                        'status' => $a->status,
                        'reference_no' => $a->appointment_no,
                        'reference_id' => $a->id,
                        'occurred_at' => $a->created_at?->toIso8601String(),
                    ]);
                });
        }

        if ($type === 'all' || $type === 'lab') {
            LabOrder::query()
                ->where('patient_id', $patientId)
                ->get()
                ->each(function (LabOrder $o) use ($entries) {
                    $entries->push([
                        'id' => 'lab-'.$o->id,
                        'type' => 'lab',
                        'title' => 'Lab tests',
                        'subtitle' => 'Order '.$o->order_no,
                        'amount' => (float) $o->total_amount,
                        'status' => $o->status,
                        'reference_no' => $o->order_no,
                        'reference_id' => $o->id,
                        'occurred_at' => $o->created_at?->toIso8601String(),
                    ]);
                });
        }

        if ($type === 'all' || $type === 'package') {
            PackagePurchase::query()
                ->with('package')
                ->where('patient_id', $patientId)
                ->get()
                ->each(function (PackagePurchase $p) use ($entries) {
                    $entries->push([
                        'id' => 'pkg-'.$p->id,
                        'type' => 'package',
                        'title' => 'Package',
                        'subtitle' => $p->package?->name ?? 'Health package',
                        'amount' => (float) $p->amount_paid,
                        'status' => $p->status,
                        'reference_no' => $p->purchase_no,
                        'reference_id' => $p->id,
                        'occurred_at' => $p->created_at?->toIso8601String(),
                    ]);
                });
        }

        $sorted = $entries->sortByDesc('occurred_at')->values();
        $items = $sorted->forPage($page, $perPage)->values();

        return new LengthAwarePaginator(
            $items,
            $sorted->count(),
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
}
