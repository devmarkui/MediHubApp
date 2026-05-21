<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Notification $resource
 */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $n = $this->resource;

        return [
            'id' => $n->id,
            'title' => $n->title,
            'body' => $n->body,
            'type' => $n->type,
            'data' => $n->data,
            'read_at' => $n->read_at?->toIso8601String(),
            'sent_at' => $n->sent_at?->toIso8601String(),
            'is_read' => $n->read_at !== null,
        ];
    }
}
