<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PackagePurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'purchase_no',
        'patient_id',
        'package_id',
        'amount_paid',
        'purchased_at',
        'expires_at',
        'visits_used',
        'visits_total',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'purchased_at' => 'datetime',
            'expires_at' => 'datetime',
            'visits_used' => 'integer',
            'visits_total' => 'integer',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }
}
