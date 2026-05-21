<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_no')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->constrained()->restrictOnDelete();
            $table->decimal('amount_paid', 10, 2);
            $table->timestamp('purchased_at');
            $table->timestamp('expires_at');
            $table->unsignedInteger('visits_used')->default(0);
            $table->unsignedInteger('visits_total');
            $table->enum('status', ['active', 'expired', 'completed', 'cancelled'])->default('active');
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_purchases');
    }
};
