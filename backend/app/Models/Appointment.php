<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_no',
        'patient_id',
        'doctor_id',
        'appointment_date',
        'appointment_time',
        'status',
        'consultation_fee',
        'payment_status',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'consultation_fee' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
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
