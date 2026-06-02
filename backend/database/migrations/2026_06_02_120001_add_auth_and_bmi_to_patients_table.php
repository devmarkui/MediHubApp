<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Stage 1 — password login (OTP scaffolding stays in place for later).
            $table->string('password')->nullable()->after('name');
            // Stage 2 — BMI basics (optional; patient or admin can fill later).
            $table->decimal('height_cm', 5, 1)->nullable()->after('blood_group');
            $table->decimal('weight_kg', 5, 1)->nullable()->after('height_cm');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['password', 'height_cm', 'weight_kg']);
        });
    }
};
