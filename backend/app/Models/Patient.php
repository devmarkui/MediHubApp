<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Patient extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'passbook_no',
        'phone',
        'name',
        'password',
        'email',
        'dob',
        'gender',
        'blood_group',
        'height_cm',
        'weight_kg',
        'language',
        'avatar_path',
        'parent_patient_id',
        'member_since',
        'expo_push_token',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'member_since' => 'date',
            'is_active' => 'boolean',
            'password' => 'hashed',
            'height_cm' => 'decimal:1',
            'weight_kg' => 'decimal:1',
        ];
    }

    /**
     * Body Mass Index, derived from height + weight. Null until both are known.
     */
    public function bmi(): ?float
    {
        $height = (float) $this->height_cm;
        $weight = (float) $this->weight_kg;

        if ($height <= 0 || $weight <= 0) {
            return null;
        }

        $metres = $height / 100;

        return round($weight / ($metres * $metres), 1);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_patient_id');
    }

    public function familyMembers(): HasMany
    {
        return $this->hasMany(self::class, 'parent_patient_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function labOrders(): HasMany
    {
        return $this->hasMany(LabOrder::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function packagePurchases(): HasMany
    {
        return $this->hasMany(PackagePurchase::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
