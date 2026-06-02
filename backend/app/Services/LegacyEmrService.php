<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Stage 3 — bridge to the clinic's previous EMR database.
 *
 * The app is wired so that old patient records (keyed by mobile number) appear
 * alongside new MediHub reports. Until the legacy API base URL + key are
 * configured (services.emr.*), this returns an empty list and nothing breaks.
 *
 * To enable, set in .env:
 *   EMR_API_BASE_URL=https://old-system.example/api
 *   EMR_API_KEY=xxxxxxxx
 */
class LegacyEmrService
{
    public function isConfigured(): bool
    {
        return ! empty(config('services.emr.base_url')) && ! empty(config('services.emr.key'));
    }

    /**
     * Fetch historical records for a phone number from the legacy EMR.
     *
     * Returns a list shaped like ReportResource so the mobile app can render
     * old + new records in one timeline.
     *
     * @return array<int, array<string, mixed>>
     */
    public function fetchForPhone(string $phone): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        try {
            $response = Http::withToken((string) config('services.emr.key'))
                ->acceptJson()
                ->timeout(8)
                ->get(rtrim((string) config('services.emr.base_url'), '/').'/records', [
                    'phone' => $phone,
                ]);

            if (! $response->successful()) {
                Log::warning('legacy_emr.fetch_failed', ['status' => $response->status(), 'phone' => $phone]);

                return [];
            }

            return $this->normalize($response->json('data') ?? $response->json() ?? []);
        } catch (Throwable $e) {
            Log::warning('legacy_emr.exception', ['message' => $e->getMessage(), 'phone' => $phone]);

            return [];
        }
    }

    /**
     * Map arbitrary legacy rows into the report shape the app expects. Adjust
     * the field mapping once the real legacy schema is known.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function normalize(array $rows): array
    {
        $out = [];
        foreach ($rows as $i => $row) {
            $out[] = [
                'id' => 'legacy-'.($row['id'] ?? $i),
                'patient_id' => null,
                'lab_order_id' => null,
                'appointment_id' => null,
                'report_type' => $row['type'] ?? 'lab',
                'title' => $row['title'] ?? 'Previous record',
                'file_size_kb' => (int) ($row['file_size_kb'] ?? 0),
                'released_at' => $row['date'] ?? $row['released_at'] ?? null,
                'source' => 'legacy',
                'download_url' => $row['url'] ?? $row['download_url'] ?? null,
            ];
        }

        return $out;
    }
}
