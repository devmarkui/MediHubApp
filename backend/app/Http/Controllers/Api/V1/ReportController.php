<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\ReportResource;
use App\Models\Patient;
use App\Models\Report;
use App\Services\ReportStorageService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController
{
    public function __construct(private ReportStorageService $files) {}

    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();
        $query = $patient->reports()->orderByDesc('released_at');

        $type = $request->query('type');
        if (is_string($type) && in_array($type, ['lab', 'consultation', 'prescription', 'imaging'], true)) {
            $query->where('report_type', $type);
        }

        return ApiResponse::ok(ReportResource::collection($query->get())->resolve());
    }

    public function show(Request $request, Report $report): JsonResponse
    {
        $this->ensureOwner($request, $report);

        return ApiResponse::ok((new ReportResource($report))->resolve());
    }

    public function downloadUrl(Request $request, Report $report): JsonResponse
    {
        $this->ensureOwner($request, $report);

        return ApiResponse::ok($this->files->signedUrl($report));
    }

    private function ensureOwner(Request $request, Report $report): void
    {
        /** @var Patient $patient */
        $patient = $request->user();
        abort_if($report->patient_id !== $patient->id, 404, 'Report not found.');
    }
}
