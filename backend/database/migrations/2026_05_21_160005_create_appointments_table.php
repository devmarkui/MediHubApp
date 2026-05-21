<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_no')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained()->restrictOnDelete();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])->default('pending');
            $table->decimal('consultation_fee', 10, 2);
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->enum('payment_method', ['online', 'reception', 'package'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['doctor_id', 'appointment_date', 'appointment_time'], 'apt_slot_unique');
            $table->index(['patient_id', 'status']);
            $table->index(['doctor_id', 'appointment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
