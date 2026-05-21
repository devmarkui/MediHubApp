<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Package;
use App\Models\PackagePurchase;
use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PackagePurchase>
 */
class PackagePurchaseFactory extends Factory
{
    protected $model = PackagePurchase::class;

    public function definition(): array
    {
        return [
            'patient_id' => Patient::factory(),
            'package_id' => Package::factory(),
            'amount_paid' => 9000,
            'purchased_at' => now(),
            'expires_at' => now()->addDays(365),
            'visits_used' => 0,
            'visits_total' => 1,
            'status' => 'active',
        ];
    }
}
