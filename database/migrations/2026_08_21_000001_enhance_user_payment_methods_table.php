<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->text('account_token')->nullable()->after('account_name');
            $table->string('binding_reference_id')->nullable()->unique()->after('account_token');
            $table->string('binding_status')->default('PENDING_OTP')->after('binding_reference_id'); // PENDING_OTP, LINKED, EXPIRED, UNLINKED
            $table->string('otp_code', 10)->nullable()->after('binding_status');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
            $table->timestamp('token_expires_at')->nullable()->after('otp_expires_at');
            $table->string('masked_phone')->nullable()->after('account_number');
        });
    }

    public function down(): void
    {
        Schema::table('user_payment_methods', function (Blueprint $table) {
            $table->dropColumn([
                'account_token',
                'binding_reference_id',
                'binding_status',
                'otp_code',
                'otp_expires_at',
                'token_expires_at',
                'masked_phone',
            ]);
        });
    }
};
