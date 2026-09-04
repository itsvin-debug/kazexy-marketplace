import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AddProductModal from '../components/modals/AddProductModal';

export default function StoreManagementPage() {
    const { user } = useAuth();
    const { showToast } = useCart();

    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [incomingOrders, setIncomingOrders] = useState([]);
    const [games, setGames] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCatFilter, setSelectedCatFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('products'); // products, orders
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [fulfillingOrder, setFulfillingOrder] = useState(null);
    const [deliveryCredentials, setDeliveryCredentials] = useState('');
    const [fulfillingLoading, setFulfillingLoading] = useState(false);

    useEffect(() => {
        fetchAllStoreData();
    }, [user]);

    const fetchAllStoreData = async () => {
        setLoading(true);
        try {
            const [statsRes, productsRes, ordersRes, gamesRes, catsRes] = await Promise.all([
                api.get('/seller/dashboard'),
                api.get('/seller/products'),
                api.get('/seller/orders'),
                api.get('/products/games'),
                api.get('/products/categories'),
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (productsRes.data.success) setProducts(productsRes.data.data);
            if (ordersRes.data.success) setIncomingOrders(ordersRes.data.data.data || []);
            if (gamesRes.data.success) setGames(gamesRes.data.data);
            if (catsRes.data.success) setCategories(catsRes.data.data);
        } catch (err) {
            console.error('Store data error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Hapus produk ini dari katalog toko?')) return;
        try {
            const res = await api.delete(`/seller/products/${id}`);
            if (res.data.success) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
                showToast('Produk berhasil dihapus.');
            }
        } catch (err) {
            console.error('Delete product error:', err);
        }
    };

    const handleFulfillSubmit = async (e) => {
        e.preventDefault();
        setFulfillingLoading(true);
        try {
            const res = await api.post(`/seller/orders/${fulfillingOrder.id}/fulfill`, {
                delivery_data: deliveryCredentials,
            });
            if (res.data.success) {
                showToast('Pesanan berhasil dikirim & dana telah masuk ke saldo toko!');
                setFulfillingOrder(null);
                setDeliveryCredentials('');
                fetchAllStoreData();
            }
        } catch (err) {
            console.error('Fulfill order error:', err);
            showToast('Gagal memproses pesanan.', 'error');
        } finally {
            setFulfillingLoading(false);
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

    const filteredProducts = products.filter((p) => {
        if (selectedCatFilter === 'all') return true;
        return p.category?.slug === selectedCatFilter;
    });

    // Guard: If user has no store yet, show locked message
    if (!user?.has_store) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">lock</span>
                </div>
                <div>
                    <h2 className="font-bold text-lg text-on-surface">Toko Belum Dibuat</h2>
                    <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
                        Anda belum memiliki toko. Klik tombol "Buat Toko" di sidebar atau di tombol akun untuk membuka toko Anda.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Store Cover Banner & Profile Details (Stitch 1:1) */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-outline-variant/20 bg-white">
                <div className="h-44 md:h-52 w-full bg-gradient-to-r from-primary-container via-primary to-secondary relative">
                    <img
                        alt="Store Cover Banner"
                        className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80"
                    />
                </div>

                <div className="p-6 md:p-8 -mt-16 md:-mt-20 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                        <div className="relative">
                            <img
                                alt="Store Avatar"
                                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                                src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCnXLEmZ0xZGzHA6VIZJQDyYa7e-ABc0WEmzS0Pq9uNXIBTSqk0tWc9FsimbNYA_mvoSA4-NDIca1MhV_CtwjSlKR1yEzxlXSkBe931IXZuG_X9Lpsyr6TtftqIWfg1d2GWswW8m9mVxpWCImPRKCrdgfjwQyNL8WCdQv6nvoTtsK_f1quROx9wlTTa1otUHgRvAf3U67wTT-MOk53eQIYuhd7S26YjZ3V1Wi3_cih4cTI5SiCb0-BE"}
                            />
                            <div className="absolute -bottom-2 -right-2 bg-secondary text-white w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Verified Seller">
                                <span className="material-symbols-outlined text-sm fill">verified</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="font-extrabold text-2xl text-on-surface">
                                {stats?.store_name || user?.store_name || 'Neon Pro Store'}
                            </h2>
                            <p className="text-xs text-on-surface-variant max-w-xl">
                                {user?.store_description || 'Pusat perlengkapan gaming premium dan akun sultan. Terpercaya sejak 2021 dengan pengiriman instan.'}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-on-surface-variant pt-1">
                                <span className="material-symbols-outlined text-sm text-[#FFB400] fill">star</span>
                                <span className="font-bold text-on-surface">{stats?.store_rating || '4.9'}</span>
                                <span>(120+ Ulasan Positif)</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 w-full md:w-auto">
                        <button
                            onClick={() => {
                                setEditingProduct(null);
                                setIsAddModalOpen(true);
                            }}
                            className="bg-primary hover:brightness-110 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Tambah Barang Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Seller Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
                    <span className="text-[10px] text-outline uppercase font-bold block">Total Pendapatan</span>
                    <span className="text-lg font-bold text-primary">{formatRupiah(stats?.total_revenue || 0)}</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
                    <span className="text-[10px] text-outline uppercase font-bold block">Produk Aktif</span>
                    <span className="text-lg font-bold text-on-surface">{products.length} Item</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
                    <span className="text-[10px] text-outline uppercase font-bold block">Pesanan Masuk</span>
                    <span className="text-lg font-bold text-secondary">{incomingOrders.length} Pesanan</span>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm">
                    <span className="text-[10px] text-outline uppercase font-bold block">Saldo Toko</span>
                    <span className="text-lg font-bold text-[#10B981]">{formatRupiah(user?.balance)}</span>
                </div>
            </div>

            {/* Tabs: Katalog Produk / Pesanan Masuk */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-5 py-2 rounded-full font-medium text-xs transition-all ${
                            activeTab === 'products'
                                ? 'bg-primary text-white font-bold shadow-sm'
                                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        }`}
                    >
                        Katalog Produk ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-5 py-2 rounded-full font-medium text-xs transition-all ${
                            activeTab === 'orders'
                                ? 'bg-primary text-white font-bold shadow-sm'
                                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                        }`}
                    >
                        Pesanan Masuk ({incomingOrders.length})
                    </button>
                </div>

                {activeTab === 'products' && (
                    <select
                        value={selectedCatFilter}
                        onChange={(e) => setSelectedCatFilter(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant rounded-lg text-xs font-medium text-on-surface px-3 py-1.5 focus:outline-none focus:border-primary"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="item-skin">Item & Skin</option>
                        <option value="akun-game">Akun Game</option>
                        <option value="top-up">Top Up</option>
                        <option value="voucher-game">Voucher Game</option>
                    </select>
                )}
            </div>

            {/* Tab 1: Product Grid */}
            {activeTab === 'products' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-[24px] overflow-hidden flex flex-col justify-between border border-outline-variant/20 shadow-sm hover:shadow-md transition"
                        >
                            <div className="aspect-[16/9] w-full overflow-hidden relative bg-surface-container-high">
                                <img
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    src={product.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                                />
                                <div className="absolute top-2.5 left-2.5 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                    {product.category?.name || 'Item'}
                                </div>
                                <div className="absolute top-2.5 right-2.5 bg-white/90 text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#10B981]' : 'bg-error'}`} />
                                    <span>{product.stock > 0 ? 'Tersedia' : 'Habis'}</span>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                                        {product.title}
                                    </h4>
                                    <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                                        {product.description}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-outline-variant/20 flex items-end justify-between">
                                    <div>
                                        <span className="text-[10px] text-outline block">Harga Jual</span>
                                        <div className="font-bold text-base text-primary">
                                            {formatRupiah(product.price)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingProduct(product);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-1.5 rounded-lg bg-surface-container hover:bg-error-container text-error"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Tab 2: Incoming Orders */
                <div className="space-y-3">
                    {incomingOrders.length === 0 ? (
                        <div className="py-16 text-center bg-white rounded-3xl border border-outline-variant/30 p-8">
                            <span className="material-symbols-outlined text-4xl text-outline mb-2">shopping_bag</span>
                            <p className="font-bold text-sm text-on-surface">Belum Ada Pesanan Masuk</p>
                            <p className="text-xs text-on-surface-variant">Pesanan dari pembeli akan muncul di sini.</p>
                        </div>
                    ) : (
                        incomingOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl p-5 border border-outline-variant/20 shadow-sm space-y-3"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2 font-mono font-bold text-primary">
                                        <span>{order.order_code}</span>
                                        <span className="text-on-surface-variant font-sans font-normal">• Pembeli: {order.buyer?.name}</span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                        order.order_status === 'completed'
                                            ? 'bg-[#10B981]/15 text-[#10B981]'
                                            : 'bg-secondary/15 text-secondary'
                                    }`}>
                                        {order.order_status === 'completed' ? '✓ Selesai' : '⏳ Perlu Diproses'}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs">
                                    {order.items?.map((it) => (
                                        <div key={it.id} className="flex justify-between text-on-surface">
                                            <span>• {it.product_title} ({it.quantity}x)</span>
                                            <span className="font-bold">{formatRupiah(it.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>

                                {order.notes && (
                                    <div className="p-2.5 rounded-lg bg-surface-container text-xs text-on-surface-variant">
                                        <span className="font-bold">Catatan:</span> {order.notes}
                                    </div>
                                )}

                                <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center text-xs">
                                    <span>Total: <strong className="text-primary font-bold">{formatRupiah(order.total_amount)}</strong></span>
                                    {order.order_status !== 'completed' && (
                                        <button
                                            onClick={() => {
                                                setFulfillingOrder(order);
                                                setDeliveryCredentials('');
                                            }}
                                            className="bg-primary hover:brightness-110 text-white font-bold text-xs px-4 py-2 rounded-lg"
                                        >
                                            Kirim Data Akun / Selesaikan
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add / Edit Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                productToEdit={editingProduct}
                onProductSaved={fetchAllStoreData}
                games={games}
                categories={categories}
            />

            {/* Fulfill Order Modal */}
            {fulfillingOrder && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                            <h3 className="font-bold text-base text-on-surface">Kirim Pesanan ke Pembeli</h3>
                            <button onClick={() => setFulfillingOrder(null)} className="text-outline hover:text-on-surface">✕</button>
                        </div>

                        <form onSubmit={handleFulfillSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface mb-1">
                                    Data Akun / Kode Voucher / Bukti Joki
                                </label>
                                <textarea
                                    rows="4"
                                    required
                                    value={deliveryCredentials}
                                    onChange={(e) => setDeliveryCredentials(e.target.value)}
                                    placeholder="Masukkan detail login akun game atau kode voucher yang siap digunakan..."
                                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={fulfillingLoading}
                                className="w-full bg-primary hover:brightness-110 text-white font-bold text-xs py-3 rounded-xl shadow-sm"
                            >
                                {fulfillingLoading ? 'Mengirim...' : 'Kirim & Selesaikan Transaksi'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
