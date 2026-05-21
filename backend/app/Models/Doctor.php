<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'specialization',
        'qualifications',
        'bio',
        'avatar_path',
        'consultation_fee',
        'languages',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'consultation_fee' => 'decimal:2',
            'languages' => 'array',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
