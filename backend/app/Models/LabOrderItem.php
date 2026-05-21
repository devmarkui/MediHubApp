<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'lab_order_id',
        'lab_test_id',
        'price',
        'result_value',
        'result_unit',
        'result_normal_range',
        'is_abnormal',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_abnormal' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(LabOrder::class, 'lab_order_id');
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(LabTest::class, 'lab_test_id');
    }
}
