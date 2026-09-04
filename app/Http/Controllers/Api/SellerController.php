<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SellerController extends Controller
{
    /**
     * Create a new store for the current user
     */
    public function createStore(Request $request)
    {
        $user = $request->user();

        if ($user->has_store) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki toko.',
            ], 422);
        }

        $validated = $request->validate([
            'store_name'        => 'required|string|min:3|max:100|unique:users,store_name',
            'store_description' => 'required|string|min:20|max:500',
            'store_category'    => 'required|string|in:items,accounts,topup,jasa,all',
            'store_contact'     => 'required|string|max:100',
            'store_logo'        => 'nullable|string|url|max:500',
        ]);

        $user->update([
            'store_name'        => $validated['store_name'],
            'store_description' => $validated['store_description'],
            'store_category'    => $validated['store_category'],
            'store_contact'     => $validated['store_contact'],
            'store_logo'        => $validated['store_logo'] ?? null,
            'store_rating'      => 5.00,
            'role'              => 'seller',
            'has_store'         => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Toko berhasil dibuat! Selamat bergabung sebagai seller di Nexus Gaming.',
            'user'    => $user->fresh(),
        ], 201);
    }

    /**
     * Get seller dashboard metrics
     */
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        $totalSales = Order::where('seller_id', $user->id)
            ->where('order_status', 'completed')
            ->sum('total_amount');

        $activeProductsCount = Product::where('user_id', $user->id)
            ->where('status', 'active')
            ->count();

        $pendingOrdersCount = Order::where('seller_id', $user->id)
            ->where('order_status', 'processing')
            ->count();

        $completedOrdersCount = Order::where('seller_id', $user->id)
            ->where('order_status', 'completed')
            ->count();

        $recentOrders = Order::with(['items', 'buyer:id,name,email'])
            ->where('seller_id', $user->id)
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => (float)$totalSales,
                'active_products' => $activeProductsCount,
                'pending_orders' => $pendingOrdersCount,
                'completed_orders' => $completedOrdersCount,
                'store_name' => $user->store_name ?: ($user->name . "'s Store"),
                'store_rating' => (float)($user->store_rating ?: 4.9),
                'wallet_balance' => (float)$user->balance,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    /**
     * Get all seller's products
     */
    public function products(Request $request)
    {
        $user = $request->user();
        $products = Product::with(['game', 'category'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Create a new product listing
     */
    public function storeProduct(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'game_id' => 'required|exists:games,id',
            'category_id' => 'required|exists:categories,id',
            'description' => 'required|string',
            'price' => 'required|numeric|min:1000',
            'original_price' => 'nullable|numeric|min:1000',
            'stock' => 'required|integer|min:1',
            'delivery_type' => 'required|in:instant,manual',
            'account_data' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        $slug = Str::slug($validated['title']) . '-' . rand(1000, 9999);

        // Fallback default image if none provided
        if (empty($validated['image_url'])) {
            $validated['image_url'] = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
        }

        $product = Product::create([
            'user_id' => $user->id,
            'game_id' => $validated['game_id'],
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'stock' => $validated['stock'],
            'delivery_type' => $validated['delivery_type'],
            'account_data' => $validated['account_data'] ?? null,
            'image_url' => $validated['image_url'],
            'status' => 'active',
            'rating' => 5.00,
            'sold_count' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produk baru berhasil ditambahkan ke toko Anda!',
            'data' => $product->load(['game', 'category']),
        ], 201);
    }

    /**
     * Update product listing
     */
    public function updateProduct(Request $request, $id)
    {
        $user = $request->user();
        $product = Product::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'game_id' => 'sometimes|required|exists:games,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:1000',
            'original_price' => 'nullable|numeric|min:1000',
            'stock' => 'sometimes|required|integer|min:0',
            'delivery_type' => 'sometimes|required|in:instant,manual',
            'account_data' => 'nullable|string',
            'image_url' => 'nullable|string',
            'status' => 'sometimes|required|in:active,inactive,sold_out',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data' => $product->load(['game', 'category']),
        ]);
    }

    /**
     * Delete product listing
     */
    public function deleteProduct(Request $request, $id)
    {
        $user = $request->user();
        $product = Product::where('user_id', $user->id)->findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus dari katalog.',
        ]);
    }

    /**
     * Incoming store orders
     */
    public function incomingOrders(Request $request)
    {
        $user = $request->user();
        $orders = Order::with(['items', 'buyer:id,name,username,email,avatar'])
            ->where('seller_id', $user->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Fulfill/Deliver manual order
     */
    public function fulfillOrder(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('seller_id', $user->id)->findOrFail($id);

        $request->validate([
            'delivery_data' => 'required|string',
        ]);

        $order->update([
            'delivery_data' => $request->delivery_data,
            'order_status' => 'completed',
            'completed_at' => now(),
        ]);

        // Credit seller balance
        $user->increment('balance', $order->total_amount);
        WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'payout',
            'amount' => $order->total_amount,
            'description' => "Pengiriman Pesanan Selesai Order #{$order->order_code}",
            'reference_code' => $order->order_code,
            'status' => 'success',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dikirim dan diselesaikan! Dana telah masuk ke saldo toko Anda.',
            'data' => $order->fresh(['items', 'buyer']),
        ]);
    }
}
