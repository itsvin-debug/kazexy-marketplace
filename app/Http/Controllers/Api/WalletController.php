<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    /**
     * Get wallet balance and overview
     */
    public function getBalance(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'balance' => (float)$user->balance,
            'tier' => $user->tier,
        ]);
    }

    /**
     * Top-up balance
     */
    public function topUp(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10000|max:50000000',
            'payment_method' => 'required|string|in:qris,bca_va,mandiri_va,gopay,dana,ovo',
        ]);

        $user = $request->user();
        $amount = (float)$request->amount;
        $refCode = 'TOPUP-' . strtoupper(Str::random(6));

        // Credit balance
        $user->increment('balance', $amount);

        // Record transaction
        $transaction = WalletTransaction::create([
            'user_id' => $user->id,
            'type' => 'topup',
            'amount' => $amount,
            'description' => 'Top Up Saldo NexusPay via ' . strtoupper(str_replace('_', ' ', $request->payment_method)),
            'reference_code' => $refCode,
            'status' => 'success',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Top Up Saldo sebesar Rp ' . number_format($amount, 0, ',', '.') . ' berhasil!',
            'balance' => (float)$user->fresh()->balance,
            'transaction' => $transaction,
        ]);
    }

    /**
     * Get wallet transactions history
     */
    public function getTransactions(Request $request)
    {
        $user = $request->user();
        $transactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
