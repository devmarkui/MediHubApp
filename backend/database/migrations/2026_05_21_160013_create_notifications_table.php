<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->enum('type', ['appointment', 'report', 'package', 'promo', 'general']);
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();
            $table->index(['patient_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
