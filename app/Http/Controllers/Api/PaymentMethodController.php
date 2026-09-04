<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPaymentMethod;
use App\Services\Payment\PaymentGatewayService;
use Illuminate\Http\Request;
use Exception;

class PaymentMethodController extends Controller
{
    protected PaymentGatewayService $paymentService;

    public function __construct(PaymentGatewayService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * List all payment methods for authenticated user
     */
    public function index(Request $request)
    {
        $methods = $request->user()->paymentMethods()->get();

        return response()->json([
            'success' => true,
            'data'    => $methods,
        ]);
    }

    /**
     * Step 1: Initiate E-Wallet Binding & Request OTP Challenge
     */
    public function initiateBinding(Request $request)
    {
        $validated = $request->validate([
            'provider'       => 'required|string|in:dana,ovo,gopay,shopeepay',
            'account_number' => ['required', 'string', 'regex:/^08[0-9]{8,12}$/'],
            'account_name'   => 'required|string|max:100',
        ], [
            'account_number.regex' => 'Nomor HP e-wallet tidak boleh mengandung huruf atau simbol. Harap hanya memasukkan angka yang diawali 08 (contoh: 081234567890).',
        ]);

        $user = $request->user();

        // Check if this provider is already linked & verified by this user
        $alreadyLinked = $user->paymentMethods()
            ->where('provider', $validated['provider'])
            ->where('binding_status', 'LINKED')
            ->first();

        if ($alreadyLinked) {
            return response()->json([
                'success' => false,
                'message' => 'Akun ' . strtoupper($validated['provider']) . ' sudah terhubung dan terverifikasi di akun Anda.',
            ], 422);
        }

        try {
            // Initiate binding challenge from Payment Gateway
            $gatewayRes = $this->paymentService->initiateAccountBinding(
                $validated['provider'],
                $validated['account_number'],
                $validated['account_name']
            );

            $cleanPhone = $gatewayRes['normalized_phone'];
            $masked = substr($cleanPhone, 0, 4) . '****' . substr($cleanPhone, -3);

            // Create or update pending binding record
            $method = $user->paymentMethods()->updateOrCreate(
                [
                    'provider'       => $validated['provider'],
                    'account_number' => $cleanPhone,
                ],
                [
                    'account_name'         => $validated['account_name'],
                    'masked_phone'         => $masked,
                    'binding_reference_id' => $gatewayRes['binding_reference_id'],
                    'binding_status'       => 'PENDING_OTP',
                    'otp_code'             => $gatewayRes['otp_code'],
                    'otp_expires_at'       => $gatewayRes['otp_expires_at'],
                    'is_primary'           => $user->paymentMethods()->where('binding_status', 'LINKED')->count() === 0,
                ]
            );

            return response()->json([
                'success'              => true,
                'message'              => "Kode OTP resmi (6 digit) telah dikirimkan ke nomor e-wallet {$masked}. Masukkan kode untuk menyelesaikan pengaitan.",
                'binding_reference_id' => $gatewayRes['binding_reference_id'],
                'masked_phone'         => $masked,
                'otp_hint'             => $gatewayRes['otp_code'], // Included for effortless testing/demo
                'status'               => 'PENDING_OTP',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Step 2: Verify OTP Code and Finalize Account Binding
     */
    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'binding_reference_id' => 'required|string|exists:user_payment_methods,binding_reference_id',
            'otp'                  => 'required|string|size:6',
        ]);

        $user = $request->user();
        $method = $user->paymentMethods()
            ->where('binding_reference_id', $validated['binding_reference_id'])
            ->firstOrFail();

        try {
            $verifyRes = $this->paymentService->verifyBindingOtp($method, $validated['otp']);

            // Set as primary if no other linked method exists
            $isPrimary = $user->paymentMethods()->where('binding_status', 'LINKED')->where('id', '!=', $method->id)->count() === 0;

            $method->update([
                'account_token'    => $verifyRes['account_token'],
                'binding_status'   => 'LINKED',
                'balance'          => $verifyRes['balance'] ?? 500000,
                'token_expires_at' => $verifyRes['token_expires_at'],
                'is_primary'       => $isPrimary || $method->is_primary,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Selamat! Akun ' . $method->provider_label . ' berhasil terverifikasi & terhubung dengan saldo aktif Rp ' . number_format($method->balance, 0, ',', '.') . '.',
                'data'    => $method->fresh(),
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Refresh live balance from e-wallet provider
     */
    public function refreshBalance(Request $request, $id)
    {
        $user   = $request->user();
        $method = $user->paymentMethods()->findOrFail($id);

        if (!$method->isLinked()) {
            return response()->json([
                'success' => false,
                'message' => 'Metode pembayaran e-wallet belum terverifikasi.',
            ], 422);
        }

        $balance = $this->paymentService->getWalletBalance($method);

        return response()->json([
            'success' => true,
            'balance' => $balance,
            'message' => 'Saldo ' . $method->provider_label . ' berhasil disinkronkan.',
            'data'    => $method->fresh(),
        ]);
    }

    /**
     * Resend fresh OTP
     */
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'binding_reference_id' => 'required|string|exists:user_payment_methods,binding_reference_id',
        ]);

        $method = $request->user()->paymentMethods()
            ->where('binding_reference_id', $validated['binding_reference_id'])
            ->firstOrFail();

        try {
            $res = $this->paymentService->resendOtp($method);

            return response()->json([
                'success'  => true,
                'message'  => 'Kode OTP baru berhasil dikirimkan.',
                'otp_hint' => $res['otp_code'],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Store standard bank transfer account (non-OTP)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'provider'       => 'required|string|in:bca,mandiri,bni,bri,dana,ovo,gopay,shopeepay',
            'account_number' => 'required|string|max:50',
            'account_name'   => 'required|string|max:100',
        ]);

        // If it's e-wallet, redirect to initiateBinding
        if (in_array($validated['provider'], ['dana', 'ovo', 'gopay', 'shopeepay'])) {
            return $this->initiateBinding($request);
        }

        // Bank Accounts (direct linking)
        $existing = $user->paymentMethods()->where('provider', $validated['provider'])->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Rekening ' . strtoupper($validated['provider']) . ' sudah ditambahkan sebelumnya.',
            ], 422);
        }

        $isPrimary = $user->paymentMethods()->where('binding_status', 'LINKED')->count() === 0;

        $method = $user->paymentMethods()->create([
            'provider'       => $validated['provider'],
            'account_number' => $validated['account_number'],
            'account_name'   => $validated['account_name'],
            'binding_status' => 'LINKED', // Bank accounts linked directly for payout/transfer
            'is_primary'     => $isPrimary,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rekening bank berhasil ditambahkan.',
            'data'    => $method,
        ], 201);
    }

    /**
     * Set a payment method as primary
     */
    public function setPrimary(Request $request, $id)
    {
        $user   = $request->user();
        $method = $user->paymentMethods()->findOrFail($id);

        if (!$method->isLinked()) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya metode pembayaran yang telah terverifikasi/terhubung yang dapat dijadikan metode utama.',
            ], 422);
        }

        // Remove primary from all others
        $user->paymentMethods()->update(['is_primary' => false]);

        // Set this one as primary
        $method->update(['is_primary' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Metode pembayaran utama berhasil diperbarui.',
        ]);
    }

    /**
     * Delete a payment method
     */
    public function destroy(Request $request, $id)
    {
        $user   = $request->user();
        $method = $user->paymentMethods()->findOrFail($id);

        $wasPrimary = $method->is_primary;
        $method->delete();

        // If deleted method was primary, make the first remaining linked one primary
        if ($wasPrimary) {
            $firstRemaining = $user->paymentMethods()->where('binding_status', 'LINKED')->first();
            if ($firstRemaining) {
                $firstRemaining->update(['is_primary' => true]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Metode pembayaran berhasil dihapus/dilepas.',
        ]);
    }
}
