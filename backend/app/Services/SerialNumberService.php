<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SerialCounter;
use Illuminate\Support\Facades\DB;

class SerialNumberService
{
    /**
     * Atomically reserve the next sequence number for the given prefix/year and
     * return a formatted serial string like "MH-2026-00482".
     */
    public function next(string $prefix, ?int $year = null): string
    {
        $year ??= (int) now()->year;

        return DB::transaction(function () use ($prefix, $year): string {
            $row = SerialCounter::query()
                ->lockForUpdate()
                ->firstOrCreate(
                    ['prefix' => $prefix, 'year' => $year],
                    ['counter' => 0]
                );

            $row->counter = $row->counter + 1;
            $row->save();

            return sprintf('%s-%d-%05d', $prefix, $year, $row->counter);
        });
    }
}
