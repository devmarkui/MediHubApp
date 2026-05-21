<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\Patient;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController
{
    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $query = $patient->notifications()->orderByDesc('sent_at');
        if ((string) $request->query('unread') === '1') {
            $query->whereNull('read_at');
        }

        return ApiResponse::ok(NotificationResource::collection($query->get())->resolve());
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        $notification = Notification::query()
            ->where('patient_id', $patient->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->read_at = now();
            $notification->save();
        }

        return ApiResponse::ok((new NotificationResource($notification))->resolve());
    }

    public function readAll(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->user();

        Notification::query()
            ->where('patient_id', $patient->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return ApiResponse::ok(null, 'All notifications marked as read.');
    }
}
