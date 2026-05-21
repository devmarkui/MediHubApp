<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('report_type', ['lab', 'consultation', 'prescription', 'imaging']);
            $table->string('title');
            $table->string('file_path');
            $table->unsignedInteger('file_size_kb');
            $table->timestamp('released_at');
            $table->timestamps();
            $table->index(['patient_id', 'report_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
