<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        $original = fake()->randomElement([12000, 18000, 25000]);

        return [
            'code' => 'PKG-'.fake()->unique()->numerify('####'),
            'name' => fake()->words(3, true),
            'name_si' => null,
            'name_ta' => null,
            'description' => fake()->paragraph(),
            'original_price' => $original,
            'discounted_price' => (int) ($original * 0.75),
            'validity_days' => 365,
            'total_visits' => 1,
            'inclusions' => ['Doctor consultation', 'Lab tests'],
            'included_test_codes' => [],
            'is_featured' => false,
            'is_active' => true,
            'display_order' => 0,
        ];
    }
}
