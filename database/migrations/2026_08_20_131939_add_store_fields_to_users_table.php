<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('has_store')->default(false)->after('store_rating');
            $table->string('store_logo')->nullable()->after('has_store');
            $table->string('store_category')->nullable()->after('store_logo');
            $table->string('store_contact')->nullable()->after('store_category');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['has_store', 'store_logo', 'store_category', 'store_contact']);
        });
    }
};
