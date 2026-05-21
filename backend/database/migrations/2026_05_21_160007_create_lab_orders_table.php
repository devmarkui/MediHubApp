<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no')->unique();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid');
            $table->enum('status', ['ordered', 'sample_collected', 'processing', 'ready', 'delivered'])->default('ordered');
            $table->enum('collection_type', ['walk_in', 'home'])->default('walk_in');
            $table->timestamp('ordered_at')->useCurrent();
            $table->timestamp('ready_at')->nullable();
            $table->timestamps();
            $table->index(['patient_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_orders');
    }
};
