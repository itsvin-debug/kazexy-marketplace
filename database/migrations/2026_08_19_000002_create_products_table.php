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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 15, 2);
            $table->decimal('original_price', 15, 2)->nullable();
            $table->integer('stock')->default(1);
            $table->enum('delivery_type', ['instant', 'manual'])->default('instant');
            $table->text('account_data')->nullable(); // Auto-delivered credentials or voucher code
            $table->string('image_url')->nullable();
            $table->enum('status', ['active', 'inactive', 'sold_out'])->default('active');
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('sold_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_flash_deal')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
