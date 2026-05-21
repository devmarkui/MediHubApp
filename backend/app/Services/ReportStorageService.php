<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Report;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Storage;

class ReportStorageService
{
    /**
     * Return a temporary download URL for the report file.
     *
     * Production: 15-minute pre-signed Backblaze B2 (S3-compatible) URL.
     * Local fallback (no B2 credentials): the public-disk URL — same shape,
     * unsigned, used only for development.
     *
     * @return array{url:string, expires_at:string}
     */
    public function signedUrl(Report $report): array
    {
        $expiresAt = now()->addMinutes(15);

        if (config('services.b2.key_id') && config('services.b2.application_key')) {
            $client = new S3Client([
                'version' => 'latest',
                'region' => (string) config('services.b2.region'),
                'endpoint' => (string) config('services.b2.endpoint'),
                'credentials' => [
                    'key' => (string) config('services.b2.key_id'),
                    'secret' => (string) config('services.b2.application_key'),
                ],
                'use_path_style_endpoint' => true,
            ]);

            $command = $client->getCommand('GetObject', [
                'Bucket' => (string) config('services.b2.bucket'),
                'Key' => $report->file_path,
            ]);

            $request = $client->createPresignedRequest($command, $expiresAt);

            return [
                'url' => (string) $request->getUri(),
                'expires_at' => $expiresAt->toIso8601String(),
            ];
        }

        return [
            'url' => Storage::disk('public')->url($report->file_path),
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }
}
