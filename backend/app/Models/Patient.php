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
        'email',
        'dob',
        'gender',
        'blood_group',
        'language',
        'avatar_path',
        'parent_patient_id',
        'member_since',
        'expo_push_token',
        'is_active',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'member_since' => 'date',
            'is_active' => 'boolean',
        ];
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
