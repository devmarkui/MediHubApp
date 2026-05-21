<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('specialization');
            $table->string('qualifications');
            $table->text('bio')->nullable();
            $table->string('avatar_path')->nullable();
            $table->decimal('consultation_fee', 10, 2);
            $table->json('languages');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->index(['is_active', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctors');
    }
};
