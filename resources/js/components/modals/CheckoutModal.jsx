import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CheckoutModal({ onOrderSuccess, onOpenTopUp, onGoToProfile, onGoToLogin }) {
    const { checkoutItems, isCheckoutOpen, setIsCheckoutOpen, showToast, clearCart } = useCart();
    const { user, fetchMe } = useAuth();

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState(null);
    const [loadingMethods, setLoadingMethods] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [orderCompleteData, setOrderCompleteData] = useState(null);

    useEffect(() => {
        if (isCheckoutOpen && user) {
            fetchUserPaymentMethods();
        }
    }, [isCheckoutOpen, user]);

    const fetchUserPaymentMethods = async () => {
        setLoadingMethods(true);
        try {
            const res = await api.get('/payment-methods');
            if (res.data.success) {
                const allMethods = res.data.data || [];
                const linkedMethods = allMethods.filter(m => m.binding_status === 'LINKED' || m.is_linked);
                setPaymentMethods(linkedMethods);
                // Select primary method or first one
                const primary = linkedMethods.find(m => m.is_primary) || linkedMethods[0];
                if (primary) {
                    setSelectedMethodId(primary.id);
                } else {
                    setSelectedMethodId(null);
                }
            }
        } catch (err) {
            console.error('Fetch payment methods error:', err);
        } finally {
            setLoadingMethods(false);
        }
    };

    if (!isCheckoutOpen) return null;

    const totalAmount = checkoutItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleConfirmPayment = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Silakan login terlebih dahulu untuk checkout.', 'error');
            return;
        }

        if (!selectedMethodId) {
            showToast('Pilih metode pembayaran terhubung Anda.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: checkoutItems.map(it => ({
                    product_id: it.id,
                    quantity: it.quantity,
                })),
                payment_method_id: selectedMethodId,
                notes: notes,
            };

            const res = await api.post('/orders/checkout', payload);
            if (res.data.success) {
                clearCart();
                if (fetchMe) await fetchMe();
                setOrderCompleteData(res.data.order);
                showToast('Pembayaran Berhasil! Pesanan Anda sedang diproses.', 'success');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            showToast(err.response?.data?.message || 'Transaksi gagal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[22px]">shopping_bag</span>
                        <h3 className="font-bold text-base text-on-surface">
                            {orderCompleteData ? 'Transaksi Selesai 🎉' : 'Konfirmasi Pembelian'}
                        </h3>
                    </div>
                    <button
                        onClick={() => {
                            setIsCheckoutOpen(false);
                            if (orderCompleteData) onOrderSuccess?.();
                        }}
                        className="p-1.5 rounded-full text-outline hover:text-on-surface transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* State 1: User Belum Login */}
                {!user ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl">lock</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-base text-on-surface">Harus Masuk Terlebih Dahulu</h4>
                            <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm mx-auto leading-relaxed">
                                Untuk menjamin keamanan transaksi dan pengiriman data akun/item game, Anda wajib masuk ke akun Nexus Gaming.
                            </p>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                            <button
                                onClick={() => {
                                    setIsCheckoutOpen(false);
                                    if (onGoToLogin) onGoToLogin('login');
                                }}
                                className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:brightness-110 shadow-sm"
                            >
                                Masuk Akun
                            </button>
                            <button
                                onClick={() => {
                                    setIsCheckoutOpen(false);
                                    if (onGoToLogin) onGoToLogin('signup');
                                }}
                                className="px-6 py-2.5 border border-primary text-primary text-xs font-bold rounded-xl hover:bg-primary/5"
                            >
                                Buat Akun Baru
                            </button>
                        </div>
                    </div>
                ) : orderCompleteData ? (
                    /* State 2: Order Completed */
                    <div className="p-6 space-y-5 text-center overflow-y-auto">
                        <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>

                        <div>
                            <h4 className="font-extrabold text-xl text-on-surface">Pembayaran Berhasil!</h4>
                            <p className="text-xs text-on-surface-variant font-mono mt-1">
                                No. Pesanan: {orderCompleteData.order_code}
                            </p>
                        </div>

                        {orderCompleteData.delivery_data && (
                            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-left space-y-2">
                                <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                                    Data Akun / Kode Voucher Instan:
                                </span>
                                <pre className="p-3 bg-white border border-outline-variant rounded-xl text-xs font-mono text-on-surface whitespace-pre-wrap select-all">
                                    {orderCompleteData.delivery_data}
                                </pre>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setIsCheckoutOpen(false);
                                onOrderSuccess?.();
                            }}
                            className="w-full py-3 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md transition"
                        >
                            Lihat Riwayat Transaksi →
                        </button>
                    </div>
                ) : (
                    /* State 3: Checkout Form with Payment Methods */
                    <form onSubmit={handleConfirmPayment} className="p-6 space-y-5 overflow-y-auto">
                        
                        {/* Order Summary Items */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                                Rincian Pesanan ({checkoutItems.length} Produk)
                            </span>
                            {checkoutItems.map((it) => (
                                <div key={it.id} className="flex justify-between items-center text-xs py-1.5 border-b border-outline-variant/20">
                                    <span className="truncate max-w-[240px] text-on-surface font-medium">
                                        {it.title} ({it.quantity}x)
                                    </span>
                                    <span className="font-bold text-primary">
                                        {formatRupiah(it.price * it.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Payment Method Selector (User's Linked Methods) */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                                    Pilih Metode Pembayaran Anda
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCheckoutOpen(false);
                                        if (onGoToProfile) onGoToProfile();
                                    }}
                                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                                >
                                    <span>+ Kelola di Profil</span>
                                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                            </div>

                            {loadingMethods ? (
                                <div className="p-4 text-center text-xs text-on-surface-variant">Memuat metode pembayaran...</div>
                            ) : paymentMethods.length === 0 ? (
                                /* Warning: No linked payment methods */
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                                        <span className="material-symbols-outlined text-[18px]">warning</span>
                                        <span>Wajib Mengaitkan Metode Pembayaran</span>
                                    </div>
                                    <p className="text-[11px] text-amber-700 leading-relaxed">
                                        Anda belum mengaitkan metode pembayaran (DANA, OVO, GoPay, BCA, dll). Silakan tambahkan metode pembayaran terlebih dahulu di halaman Profil untuk melanjutkan checkout.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCheckoutOpen(false);
                                            if (onGoToProfile) onGoToProfile();
                                        }}
                                        className="mt-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                                    >
                                        Kaitkan Metode Pembayaran Sekarang
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {paymentMethods.map((method) => {
                                        const isSelected = selectedMethodId === method.id;
                                        return (
                                            <label
                                                key={method.id}
                                                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-outline-variant/40 bg-surface-container-low hover:bg-surface-container'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method_id"
                                                        value={method.id}
                                                        checked={isSelected}
                                                        onChange={() => setSelectedMethodId(method.id)}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-xs text-on-surface uppercase">
                                                                {method.provider}
                                                            </p>
                                                            {method.is_primary && (
                                                                <span className="px-1.5 py-0.2 rounded bg-primary text-white text-[9px] font-bold">
                                                                    Utama
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-on-surface-variant font-mono">
                                                            {method.account_number} • a.n. {method.account_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                                                    credit_card
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Order Notes */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                                Catatan untuk Penjual (Opsional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Tolong kirim ke User ID: 1234567..."
                                className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Total Bill */}
                        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex justify-between items-center">
                            <div>
                                <span className="text-[10px] text-outline uppercase block">Total Pembayaran</span>
                                <span className="text-xl font-extrabold text-primary">{formatRupiah(totalAmount)}</span>
                            </div>
                            <span className="text-[11px] text-[#10B981] font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">verified_user</span> Transaksi Aman
                            </span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || paymentMethods.length === 0 || !selectedMethodId}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memproses Transaksi...</span>
                                </>
                            ) : (
                                <span>Bayar Sekarang ({formatRupiah(totalAmount)})</span>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
