<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LabOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_no',
        'patient_id',
        'appointment_id',
        'total_amount',
        'payment_status',
        'status',
        'collection_type',
        'ordered_at',
        'ready_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'ordered_at' => 'datetime',
            'ready_at' => 'datetime',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(LabOrderItem::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
