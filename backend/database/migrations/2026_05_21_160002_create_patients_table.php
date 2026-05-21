<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('passbook_no')->unique();
            $table->string('phone')->unique()->index();
            $table->string('name');
            $table->string('email')->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();
            $table->enum('language', ['en', 'si', 'ta'])->default('en');
            $table->string('avatar_path')->nullable();
            $table->foreignId('parent_patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->date('member_since')->useCurrent();
            $table->string('expo_push_token')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
