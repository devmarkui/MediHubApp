<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'name_si',
        'name_ta',
        'description',
        'original_price',
        'discounted_price',
        'validity_days',
        'total_visits',
        'image_path',
        'inclusions',
        'included_test_codes',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'discounted_price' => 'decimal:2',
            'validity_days' => 'integer',
            'total_visits' => 'integer',
            'inclusions' => 'array',
            'included_test_codes' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(PackagePurchase::class);
    }

    public function getRouteKeyName(): string
    {
        return 'code';
    }
}
