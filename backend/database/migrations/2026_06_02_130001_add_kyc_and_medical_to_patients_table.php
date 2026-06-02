<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Core identity (KYC)
            $table->string('nic')->nullable()->after('name');
            // Contact details
            $table->string('address')->nullable()->after('email');
            $table->string('district')->nullable()->after('address');
            $table->string('postal_code')->nullable()->after('district');
            // Medical profile (health passbook)
            $table->text('allergies')->nullable()->after('weight_kg');
            $table->text('chronic_conditions')->nullable()->after('allergies');
            $table->text('current_medications')->nullable()->after('chronic_conditions');
            $table->text('past_surgeries')->nullable()->after('current_medications');
            // Emergency contact
            $table->string('emergency_contact_name')->nullable()->after('past_surgeries');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'nic',
                'address',
                'district',
                'postal_code',
                'allergies',
                'chronic_conditions',
                'current_medications',
                'past_surgeries',
                'emergency_contact_name',
                'emergency_contact_phone',
            ]);
        });
    }
};
