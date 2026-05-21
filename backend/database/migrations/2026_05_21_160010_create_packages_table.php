<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('name_si')->nullable();
            $table->string('name_ta')->nullable();
            $table->text('description');
            $table->decimal('original_price', 10, 2);
            $table->decimal('discounted_price', 10, 2);
            $table->unsignedInteger('validity_days')->default(365);
            $table->unsignedInteger('total_visits')->default(1);
            $table->string('image_path')->nullable();
            $table->json('inclusions');
            $table->json('included_test_codes');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->index(['is_active', 'is_featured', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
