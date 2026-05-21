<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'lab_order_id',
        'appointment_id',
        'report_type',
        'title',
        'file_path',
        'file_size_kb',
        'released_at',
    ];

    protected function casts(): array
    {
        return [
            'released_at' => 'datetime',
            'file_size_kb' => 'integer',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function labOrder(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
