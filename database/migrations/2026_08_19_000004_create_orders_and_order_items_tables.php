<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('total_amount', 15, 2);
            $table->string('payment_method')->default('nexus_pay'); // nexus_pay, qris, bca_va, mandiri_va
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('paid');
            $table->enum('order_status', ['pending_payment', 'processing', 'completed', 'cancelled'])->default('completed');
            $table->text('delivery_data')->nullable(); // Delivered account credentials/voucher code
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->string('product_title');
            $table->string('game_name')->nullable();
            $table->string('category_name')->nullable();
            $table->string('image_url')->nullable();
            $table->decimal('price', 15, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
