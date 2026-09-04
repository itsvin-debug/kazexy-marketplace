<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->decimal('balance', 14, 2)->default(0)->after('masked_phone');
        });
    }

    public function down(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }
};
