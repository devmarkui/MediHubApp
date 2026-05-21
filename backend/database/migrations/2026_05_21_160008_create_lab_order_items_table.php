<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_test_id')->constrained()->restrictOnDelete();
            $table->decimal('price', 10, 2);
            $table->string('result_value')->nullable();
            $table->string('result_unit')->nullable();
            $table->string('result_normal_range')->nullable();
            $table->boolean('is_abnormal')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_order_items');
    }
};
