import React, { useState } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function OrderDetailModal({ order, onClose, onOrderUpdated }) {
    const { showToast } = useCart();
    const [confirming, setConfirming] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!order) return null;

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCopy = () => {
        if (order.delivery_data) {
            navigator.clipboard.writeText(order.delivery_data);
            setCopied(true);
            showToast('Data akun / voucher disalin ke clipboard!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConfirmReceipt = async () => {
        setConfirming(true);
        try {
            const res = await api.post(`/orders/${order.id}/confirm`);
            if (res.data.success) {
                showToast('Pesanan telah dikonfirmasi selesai!');
                onOrderUpdated?.();
                onClose();
            }
        } catch (err) {
            console.error('Confirm receipt error:', err);
            showToast('Gagal mengonfirmasi pesanan.', 'error');
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-5 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <div>
                        <span className="text-[10px] font-bold text-outline uppercase block">Detail Transaksi</span>
                        <h3 className="font-mono font-bold text-base text-primary">{order.order_code}</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">✕</button>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
                    <div>
                        <span className="text-outline block">Tanggal Pesanan:</span>
                        <span className="font-bold text-on-surface">{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                        <span className="text-outline block">Penjual:</span>
                        <span className="font-bold text-on-surface">{order.seller?.store_name || order.seller?.name}</span>
                    </div>
                    <div>
                        <span className="text-outline block">Metode Bayar:</span>
                        <span className="font-bold text-on-surface uppercase">{order.payment_method}</span>
                    </div>
                    <div>
                        <span className="text-outline block">Status:</span>
                        <span className="font-bold text-[#10B981] capitalize">{order.order_status}</span>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-2 max-h-44 overflow-y-auto">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">Daftar Item</span>
                    {order.items?.map((it) => (
                        <div key={it.id} className="flex justify-between items-center text-xs py-1.5 border-b border-outline-variant/20">
                            <div>
                                <p className="font-bold text-on-surface">{it.product_title}</p>
                                <p className="text-[10px] text-on-surface-variant">{it.game_name} • {it.quantity}x</p>
                            </div>
                            <span className="font-bold text-primary">{formatRupiah(it.subtotal)}</span>
                        </div>
                    ))}
                </div>

                {/* Delivery Credentials Data (Instant delivery key) */}
                {order.delivery_data ? (
                    <div className="space-y-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] fill">bolt</span> Data Akun / Kode Voucher:
                            </span>
                            <button
                                onClick={handleCopy}
                                className="text-[10px] font-bold bg-white border border-outline-variant px-2.5 py-1 rounded-lg hover:bg-surface-container transition"
                            >
                                {copied ? '✓ Tersalin!' : 'Salin Data'}
                            </button>
                        </div>
                        <pre className="p-3 bg-white border border-outline-variant rounded-xl text-xs font-mono text-on-surface whitespace-pre-wrap select-all">
                            {order.delivery_data}
                        </pre>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs">
                        ⏳ Menunggu pengiriman data akun/voucher dari penjual.
                    </div>
                )}

                {/* Total & Action */}
                <div className="pt-3 border-t border-outline-variant/30 flex justify-between items-center">
                    <div>
                        <span className="text-[10px] text-outline uppercase block">Total Transaksi</span>
                        <span className="text-lg font-bold text-primary">{formatRupiah(order.total_amount)}</span>
                    </div>

                    {order.order_status === 'processing' && (
                        <button
                            onClick={handleConfirmReceipt}
                            disabled={confirming}
                            className="bg-[#10B981] hover:brightness-110 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
                        >
                            {confirming ? 'Mengonfirmasi...' : '✓ Konfirmasi Pesanan Selesai'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
