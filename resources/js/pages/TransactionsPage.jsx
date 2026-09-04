import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OrderDetailModal from '../components/modals/OrderDetailModal';

export default function TransactionsPage({ setCurrentRoute }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, [user, statusFilter]);

    const fetchOrders = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;

            const res = await api.get('/orders', { params });
            if (res.data.success) {
                setOrders(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#10B981]/15 text-[#10B981] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Selesai
                    </span>
                );
            case 'processing':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/15 text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" /> Sedang Diproses
                    </span>
                );
            case 'pending_payment':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Menunggu Pembayaran
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-error/15 text-error">
                        Dibatalkan
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Header (Stitch 1:1) */}
            <div className="space-y-2 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span onClick={() => setCurrentRoute('dashboard')} className="cursor-pointer hover:text-primary">Beranda</span>
                    <span>/</span>
                    <span className="font-bold text-primary">Transaksi</span>
                </div>
                <h1 className="font-extrabold text-2xl md:text-3xl text-on-surface tracking-tight">
                    Riwayat & Status Transaksi
                </h1>
                <p className="text-xs text-on-surface-variant">
                    Pantau status pesanan dan klaim kode akun/voucher secara instan.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        statusFilter === 'all'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Semua Transaksi
                </button>
                <button
                    onClick={() => setStatusFilter('processing')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        statusFilter === 'processing'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Sedang Diproses
                </button>
                <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        statusFilter === 'completed'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Selesai
                </button>
                <button
                    onClick={() => setStatusFilter('pending_payment')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        statusFilter === 'pending_payment'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Menunggu Pembayaran
                </button>
            </div>

            {/* Transactions List */}
            {loading ? (
                <div className="py-24 text-center text-on-surface-variant">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Memuat riwayat transaksi...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-outline-variant/30 p-8 space-y-3">
                    <span className="material-symbols-outlined text-4xl text-outline">receipt_long</span>
                    <h3 className="font-bold text-base text-on-surface">Belum Ada Transaksi</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                        Anda belum memiliki pesanan dengan filter status ini.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={() => setCurrentRoute('dashboard')}
                            className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:brightness-110 shadow-sm"
                        >
                            Mulai Belanja di Marketplace
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="p-5 md:p-6 rounded-[24px] bg-white border border-outline-variant/20 shadow-sm hover:shadow-md transition space-y-4"
                        >
                            {/* Card Top Meta */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20 text-xs">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-primary bg-surface-container px-3 py-1 rounded-lg">
                                        {order.order_code}
                                    </span>
                                    <span className="text-on-surface-variant">{formatDate(order.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-on-surface-variant font-medium">
                                        {order.seller?.store_name || order.seller?.name || 'Nexus Merchant'}
                                    </span>
                                    {getStatusBadge(order.order_status)}
                                </div>
                            </div>

                            {/* Ordered Items */}
                            <div className="space-y-3">
                                {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5">
                                            <img
                                                src={item.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80"}
                                                alt={item.product_title}
                                                className="w-14 h-14 rounded-xl object-cover bg-surface-container-high shrink-0"
                                            />
                                            <div>
                                                <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                                                    {item.product_title}
                                                </h4>
                                                <p className="text-xs text-on-surface-variant mt-0.5">
                                                    {item.game_name} • {item.quantity}x @ {formatRupiah(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-on-surface shrink-0">
                                            {formatRupiah(item.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Instant Delivery Key Notification if ready */}
                            {order.delivery_data && (
                                <div className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
                                        <span className="material-symbols-outlined text-[18px] fill">bolt</span>
                                        <span>Data akun & voucher instan siap disalin</span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        Buka & Salin Data →
                                    </button>
                                </div>
                            )}

                            {/* Footer Total and Details Button */}
                            <div className="pt-3 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <span className="text-[10px] text-outline uppercase block">Total Belanja</span>
                                    <span className="text-base font-bold text-primary">
                                        {formatRupiah(order.total_amount)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold rounded-lg transition"
                                >
                                    Lihat Detail Transaksi
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onOrderUpdated={fetchOrders}
                />
            )}
        </div>
    );
}
