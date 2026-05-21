<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\Patient;
use App\Services\PassbookService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PassbookController
{
    public function __construct(private PassbookService $service) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $type = (string) $request->query('type', 'all');
        if (! in_array($type, ['all', 'lab', 'consultation', 'package'], true)) {
            $type = 'all';
        }

        $page = max(1, (int) $request->query('page', 1));
        $perPage = min(50, max(5, (int) $request->query('per_page', 20)));

        $cacheKey = "passbook:{$patient->id}:{$type}:{$page}:{$perPage}";

        $payload = Cache::remember($cacheKey, now()->addSeconds(60), function () use ($patient, $type, $page, $perPage): array {
            $feed = $this->service->feed($patient->id, $type, $page, $perPage);

            return [
                'items' => $feed->items(),
                'meta' => [
                    'current_page' => $feed->currentPage(),
                    'per_page' => $feed->perPage(),
                    'last_page' => $feed->lastPage(),
                    'total' => $feed->total(),
                ],
            ];
        });

        return ApiResponse::ok($payload);
    }
}
