import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function TopUpModal({ isOpen, onClose }) {
    const { user, refreshUser } = useAuth();
    const { showToast } = useCart();

    const [amount, setAmount] = useState(100000);
    const [method, setMethod] = useState('qris');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const nominalPresets = [50000, 100000, 250000, 500000, 1000000, 2500000];

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const handleTopUpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/wallet/topup', {
                amount: amount,
                payment_method: method,
            });
            if (res.data.success) {
                await refreshUser();
                showToast(`Top Up ${formatRupiah(amount)} Berhasil! Saldo ditambahkan.`);
                onClose();
            }
        } catch (err) {
            console.error('Top up error:', err);
            showToast('Top up gagal. Coba lagi nanti.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <div>
                        <h3 className="font-bold text-base text-on-surface">Top Up Saldo NexusPay</h3>
                        <p className="text-[11px] text-on-surface-variant">Isi saldo instan tanpa biaya admin</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">✕</button>
                </div>

                <form onSubmit={handleTopUpSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-2">Pilih Nominal</label>
                        <div className="grid grid-cols-3 gap-2">
                            {nominalPresets.map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => setAmount(nom)}
                                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                                        amount === nom
                                            ? 'border-primary bg-primary text-white shadow-sm'
                                            : 'border-outline-variant/40 bg-surface-container-low text-on-surface hover:bg-surface-container'
                                    }`}
                                >
                                    {formatRupiah(nom)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">Nominal Custom</label>
                        <input
                            type="number"
                            min="10000"
                            step="5000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-bold focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-2">Metode Pembayaran</label>
                        <div className="space-y-2">
                            <label className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name="topup_method"
                                        checked={method === 'qris'}
                                        onChange={() => setMethod('qris')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-bold text-on-surface">QRIS Instant</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#10B981]">Gratis Biaya</span>
                            </label>

                            <label className="p-3 rounded-xl border border-outline-variant/40 bg-surface-container-low flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="radio"
                                        name="topup_method"
                                        checked={method === 'bca_va'}
                                        onChange={() => setMethod('bca_va')}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-xs font-bold text-on-surface">BCA Virtual Account</span>
                                </div>
                                <span className="text-[10px] font-bold text-[#10B981]">Gratis Biaya</span>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md transition"
                    >
                        {loading ? 'Memproses...' : `Top Up Sekarang (${formatRupiah(amount)})`}
                    </button>
                </form>
            </div>
        </div>
    );
}
