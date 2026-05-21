<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SerialCounter extends Model
{
    protected $fillable = ['prefix', 'year', 'counter'];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'counter' => 'integer',
        ];
    }
}
