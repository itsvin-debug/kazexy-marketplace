<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SellerController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

// ─── Public Routes ─────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public: Products catalogue (anyone can browse)
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/flash-deals', [ProductController::class, 'flashDeals']);
    Route::get('/games', [ProductController::class, 'games']);
    Route::get('/categories', [ProductController::class, 'categories']);
    Route::get('/{id}', [ProductController::class, 'show']);
});

// ─── Authenticated Routes ──────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profile
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/password', [AuthController::class, 'updatePassword']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Payment Methods (linked e-wallets with OTP & bank accounts)
    Route::prefix('payment-methods')->group(function () {
        Route::get('/', [PaymentMethodController::class, 'index']);
        Route::post('/', [PaymentMethodController::class, 'store']);
        Route::post('/bind', [PaymentMethodController::class, 'initiateBinding']);
        Route::post('/verify-otp', [PaymentMethodController::class, 'verifyOtp']);
        Route::post('/resend-otp', [PaymentMethodController::class, 'resendOtp']);
        Route::post('/{id}/refresh-balance', [PaymentMethodController::class, 'refreshBalance']);
        Route::patch('/{id}/set-primary', [PaymentMethodController::class, 'setPrimary']);
        Route::delete('/{id}', [PaymentMethodController::class, 'destroy']);
    });

    // Favorites / Wishlist
    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/toggle/{productId}', [FavoriteController::class, 'toggle']);
        Route::delete('/{productId}', [FavoriteController::class, 'destroy']);
    });

    // Orders & Transactions
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/checkout', [OrderController::class, 'store']);
        Route::post('/{id}/confirm', [OrderController::class, 'confirmReceipt']);
    });

    // Seller Store Management
    Route::prefix('seller')->group(function () {
        // Create store (available to all authenticated users)
        Route::post('/create-store', [SellerController::class, 'createStore']);

        // These require the user to already have a store
        Route::get('/dashboard', [SellerController::class, 'dashboardStats']);
        Route::get('/products', [SellerController::class, 'products']);
        Route::post('/products', [SellerController::class, 'storeProduct']);
        Route::put('/products/{id}', [SellerController::class, 'updateProduct']);
        Route::delete('/products/{id}', [SellerController::class, 'deleteProduct']);
        Route::get('/orders', [SellerController::class, 'incomingOrders']);
        Route::post('/orders/{id}/fulfill', [SellerController::class, 'fulfillOrder']);
    });

    // Digital Wallet (NexusPay)
    Route::prefix('wallet')->group(function () {
        Route::get('/balance', [WalletController::class, 'getBalance']);
        Route::post('/topup', [WalletController::class, 'topUp']);
        Route::get('/transactions', [WalletController::class, 'getTransactions']);
    });
});
