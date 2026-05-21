<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Helper for the standard JSON envelope:
 * { "success": bool, "data": any, "message": string|null }
 */
class ApiResponse
{
    public static function ok(mixed $data = null, ?string $message = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => self::unwrap($data),
            'message' => $message,
        ], $status);
    }

    public static function fail(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $body = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $body['errors'] = $errors;
        }

        return response()->json($body, $status);
    }

    private static function unwrap(mixed $data): mixed
    {
        if ($data instanceof JsonResource || $data instanceof ResourceCollection) {
            return $data->resolve();
        }

        if ($data instanceof Arrayable) {
            return $data->toArray();
        }

        return $data;
    }
}
