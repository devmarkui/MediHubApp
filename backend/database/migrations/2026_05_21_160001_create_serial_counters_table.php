<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('serial_counters', function (Blueprint $table) {
            $table->id();
            $table->string('prefix', 16);
            $table->unsignedSmallInteger('year');
            $table->unsignedBigInteger('counter')->default(0);
            $table->timestamps();
            $table->unique(['prefix', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('serial_counters');
    }
};
