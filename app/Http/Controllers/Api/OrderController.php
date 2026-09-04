<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

use App\Services\Payment\PaymentGatewayService;

class OrderController extends Controller
{
    protected PaymentGatewayService $paymentService;

    public function __construct(PaymentGatewayService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Get transaction history for current user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['items.product', 'seller:id,name,username,avatar,store_name'])
            ->where('buyer_id', $user->id);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        $orders = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * Get single transaction detail
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with(['items.product.game', 'seller:id,name,username,avatar,store_name,store_rating', 'buyer:id,name,email'])
            ->where(function ($q) use ($user) {
                $q->where('buyer_id', $user->id)->orWhere('seller_id', $user->id);
            })
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * Checkout and create order
     */
    public function store(Request $request)
    {
        $request->validate([
            'items'                => 'required|array|min:1',
            'items.*.product_id'   => 'required|exists:products,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'payment_method_id'    => 'required|integer',
            'notes'                => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Verify user has the specified payment method
        $paymentMethodRecord = $user->paymentMethods()->find($request->payment_method_id);
        if (!$paymentMethodRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran tidak valid. Silakan tambahkan metode pembayaran di halaman Profil.',
            ], 422);
        }

        // Verify that the payment method is fully verified via OTP
        if (!$paymentMethodRecord->isLinked()) {
            return response()->json([
                'success' => false,
                'message' => 'Akun e-wallet ' . $paymentMethodRecord->provider_label . ' belum terverifikasi dengan kode OTP. Silakan lakukan verifikasi OTP di menu Profil -> Metode Pembayaran terlebih dahulu.',
            ], 422);
        }

        $itemsData = $request->items;
        $paymentMethod = $paymentMethodRecord->provider_label . ' (' . ($paymentMethodRecord->masked_phone ?? $paymentMethodRecord->account_number) . ')';

        return DB::transaction(function () use ($user, $itemsData, $paymentMethod, $request, $paymentMethodRecord) {
            $totalAmount = 0;
            $orderItemsToCreate = [];
            $sellerId = null;
            $deliveryCredentials = [];

            foreach ($itemsData as $item) {
                $product = Product::with(['game', 'category', 'seller'])->lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok produk '{$product->title}' tidak mencukupi (sisa {$product->stock}).",
                    ], 422);
                }

                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;
                $sellerId = $product->user_id;

                // Decrease stock
                $product->decrement('stock', $item['quantity']);
                $product->increment('sold_count', $item['quantity']);
                if ($product->stock <= 0) {
                    $product->update(['status' => 'sold_out']);
                }

                if ($product->delivery_type === 'instant' && $product->account_data) {
                    $deliveryCredentials[] = "[{$product->title}]\n" . $product->account_data;
                }

                $orderItemsToCreate[] = [
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'game_name' => $product->game ? $product->game->name : 'Game',
                    'category_name' => $product->category ? $product->category->name : 'Item',
                    'image_url' => $product->image_url,
                    'price' => $product->price,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            // Check balance if paying with NexusPay
            if ($paymentMethod === 'nexus_pay') {
                if ($user->balance < $totalAmount) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Saldo NexusPay Anda tidak mencukupi (Saldo: Rp ' . number_format($user->balance, 0, ',', '.') . '). Silakan lakukan Top Up.',
                    ], 422);
                }

                // Deduct buyer balance
                $user->decrement('balance', $totalAmount);

                // Create wallet transaction
                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'purchase',
                    'amount' => -$totalAmount,
                    'description' => 'Pembelian di Marketplace Nexus Gaming',
                    'status' => 'success',
                ]);
            }

            $orderCode = 'NEX-' . strtoupper(Str::random(4)) . '-' . rand(1000, 9999);
            $orderStatus = !empty($deliveryCredentials) ? 'completed' : 'processing';

            $order = Order::create([
                'order_code' => $orderCode,
                'buyer_id' => $user->id,
                'seller_id' => $sellerId,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'order_status' => $orderStatus,
                'delivery_data' => !empty($deliveryCredentials) ? implode("\n\n---\n\n", $deliveryCredentials) : null,
                'notes' => $request->notes,
                'completed_at' => $orderStatus === 'completed' ? now() : null,
            ]);

            // If paying with linked E-Wallet, execute tokenized charge via PaymentGatewayService
            if ($paymentMethodRecord && $paymentMethodRecord->isEwallet()) {
                try {
                    $this->paymentService->chargeLinkedWallet($order, $paymentMethodRecord);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'message' => $e->getMessage(),
                    ], 422);
                }
            }

            foreach ($orderItemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            // If completed, credit seller balance
            if ($orderStatus === 'completed' && $sellerId) {
                $seller = User::find($sellerId);
                if ($seller) {
                    $seller->increment('balance', $totalAmount);
                    WalletTransaction::create([
                        'user_id' => $seller->id,
                        'type' => 'payout',
                        'amount' => $totalAmount,
                        'description' => "Penjualan Order #{$orderCode}",
                        'reference_code' => $orderCode,
                        'status' => 'success',
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diproses! ' . ($orderStatus === 'completed' ? 'Item instan telah dikirimkan.' : 'Penjual sedang memproses pesanan Anda.'),
                'data' => $order->load('items'),
                'current_balance' => $user->fresh()->balance,
            ], 201);
        });
    }

    /**
     * Buyer confirms order receipt
     */
    public function confirmReceipt(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::where('buyer_id', $user->id)->findOrFail($id);

        if ($order->order_status === 'completed') {
            return response()->json([
                'success' => true,
                'message' => 'Pesanan ini sudah selesai.',
            ]);
        }

        $order->update([
            'order_status' => 'completed',
            'completed_at' => now(),
        ]);

        // Release funds to seller if not already credited
        if ($order->seller_id) {
            $seller = User::find($order->seller_id);
            if ($seller) {
                $seller->increment('balance', $order->total_amount);
                WalletTransaction::create([
                    'user_id' => $seller->id,
                    'type' => 'payout',
                    'amount' => $order->total_amount,
                    'description' => "Penjualan Selesai Order #{$order->order_code}",
                    'reference_code' => $order->order_code,
                    'status' => 'success',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Pesanan telah selesai dikonfirmasi.',
            'data' => $order->fresh(['items', 'seller']),
        ]);
    }
}
