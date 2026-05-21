<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_no')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('LKR');
            $table->enum('method', ['payhere', 'cash', 'card_reception']);
            $table->string('gateway_reference')->nullable();
            $table->json('gateway_response')->nullable();
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending');
            $table->string('payable_type');
            $table->unsignedBigInteger('payable_id');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['payable_type', 'payable_id']);
            $table->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
