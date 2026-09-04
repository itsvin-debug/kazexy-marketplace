import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({ searchQuery, selectedGameSlug, setSelectedGameSlug, onOpenTopUp }) {
    const { addToCart, startCheckout, showToast } = useCart();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [favoritesMap, setFavoritesMap] = useState({});
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);

    // Initial load
    useEffect(() => {
        fetchCategories();
        fetchFavorites();
    }, [user]);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedGameSlug, searchQuery]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const res = await api.get('/favorites');
            if (res.data.success) {
                const map = {};
                res.data.data.forEach((fav) => {
                    map[fav.product_id] = true;
                });
                setFavoritesMap(map);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
            if (selectedGameSlug && selectedGameSlug !== 'all') params.game = selectedGameSlug;
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/products', { params });
            if (res.data.success) {
                setProducts(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (e, productId) => {
        e.stopPropagation();
        if (!user) {
            showToast('Silakan login untuk menyimpan produk ke favorit.', 'error');
            return;
        }

        try {
            const res = await api.post(`/favorites/toggle/${productId}`);
            if (res.data.success) {
                setFavoritesMap((prev) => ({
                    ...prev,
                    [productId]: res.data.is_favorited,
                }));
                showToast(res.data.message);
            }
        } catch (err) {
            console.error('Favorite toggle error:', err);
        }
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="space-y-6">
            
            {/* Banner Carousel (Stitch Design 1:1) */}
            <div className="w-full h-64 md:h-72 rounded-2xl overflow-hidden relative group shadow-sm">
                <img
                    alt="Promo Event Game Banner"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN048AoTJQSCRhUhS8smW4AnIeD3wpF_ajCyPf2nJbXvn1j28GpTu9M7vvXYY7sbe7srGOYEoleIPlSWC98HjsgtcrlkFFBaqz_MlGfn-T4d51uJMcjgpbUc3S-Om3Pz2F8a9S2AaOymjoMIMQtpHnBQlI2k7DzfOShYCu15R3BHbMqDzD4Rk2h2ZGemFDvA0rAIoIfsNQ7VFqoci1_DH_X7OE-UMIO04t4Vj3hKRNv5-yDqd9Dq7t"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-12">
                    <div className="max-w-xl space-y-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-secondary text-white uppercase tracking-wider">
                            Event Terbatas 2026
                        </span>
                        <h2 className="text-white font-extrabold text-2xl md:text-4xl leading-tight">
                            Promo Top Up Terbesar
                        </h2>
                        <p className="text-xs md:text-sm text-slate-200 line-clamp-2">
                            Diskon hingga 35% untuk skin Kuronami Vandal, Genesis Crystal, dan Akun Sultan MLBB bergaransi 100%.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    const el = document.getElementById('catalog-section');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="bg-primary hover:brightness-110 text-white px-6 py-2.5 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95"
                            >
                                Klaim Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Filter Buttons (Stitch 1:1) */}
            <div id="catalog-section" className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'all'
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Semua Kategori
                </button>
                <button
                    onClick={() => setSelectedCategory('top-up')}
                    className={`px-6 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'top-up'
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Top Up
                </button>
                <button
                    onClick={() => setSelectedCategory('akun-game')}
                    className={`px-6 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'akun-game'
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Beli Akun
                </button>
                <button
                    onClick={() => setSelectedCategory('item-skin')}
                    className={`px-6 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'item-skin'
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Beli Item
                </button>
                <button
                    onClick={() => setSelectedCategory('voucher-game')}
                    className={`px-6 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'voucher-game'
                            ? 'bg-primary text-white shadow-sm font-bold'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Voucher Game
                </button>
            </div>

            {/* Product Grid (Stitch 1:1) */}
            {loading ? (
                <div className="py-24 text-center text-on-surface-variant">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Memuat katalog game...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-outline-variant/30 p-8 space-y-2">
                    <p className="font-bold text-on-surface text-base">Tidak ada produk yang cocok</p>
                    <p className="text-xs text-on-surface-variant">Coba ubah kata kunci atau kategori pencarian.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isFav = !!favoritesMap[product.id];
                        return (
                            <div
                                key={product.id}
                                onClick={() => setSelectedProductDetail(product)}
                                className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative flex flex-col justify-between cursor-pointer border border-outline-variant/20"
                            >
                                {/* Thumbnail with Discount / Tag */}
                                <div className="aspect-[16/9] overflow-hidden relative bg-surface-container-high">
                                    <img
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        src={product.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                                    />
                                    {product.original_price && (
                                        <div className="absolute top-3 right-3 bg-error text-white px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
                                            -20%
                                        </div>
                                    )}
                                    {product.delivery_type === 'instant' && (
                                        <div className="absolute bottom-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px] fill">bolt</span> Instan
                                        </div>
                                    )}
                                </div>

                                {/* Content Details */}
                                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-sm text-on-surface truncate">
                                            {product.title}
                                        </h3>
                                        <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-1">
                                            <span className="material-symbols-outlined text-sm text-[#FFB400] fill">star</span>
                                            <span className="font-bold text-on-surface">{product.rating || '4.9'}</span>
                                            <span className="mx-1">•</span>
                                            <span className="truncate">{product.seller?.store_name || product.seller?.name || 'Toko Pro Gaming'}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4 pt-2 border-t border-outline-variant/20">
                                        <div>
                                            {product.original_price && (
                                                <span className="text-[10px] text-outline line-through block">
                                                    {formatRupiah(product.original_price)}
                                                </span>
                                            )}
                                            <div className="font-bold text-base text-primary">
                                                {formatRupiah(product.price)}
                                            </div>
                                        </div>

                                        <div className="flex gap-1.5 items-center">
                                            <button
                                                onClick={(e) => toggleFavorite(e, product.id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isFav ? 'text-error' : 'text-outline hover:text-error'
                                                }`}
                                                title="Favorit"
                                            >
                                                <span className={`material-symbols-outlined text-[20px] ${isFav ? 'fill' : ''}`}>
                                                    favorite
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startCheckout([{ ...product, quantity: 1 }]);
                                                }}
                                                className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-bold text-xs hover:brightness-110 transition-all active:scale-95 shadow-sm"
                                            >
                                                Beli
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProductDetail && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
                            <span className="font-bold text-sm text-primary">Detail Produk</span>
                            <button
                                onClick={() => setSelectedProductDetail(null)}
                                className="p-1 rounded-full text-outline hover:text-on-surface"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-surface-container-high">
                                <img
                                    src={selectedProductDetail.image_url}
                                    alt={selectedProductDetail.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
                                    {selectedProductDetail.game?.name || 'Game'}
                                </span>
                                <h2 className="font-bold text-xl text-on-surface">
                                    {selectedProductDetail.title}
                                </h2>
                                <div className="text-xl font-bold text-primary">
                                    {formatRupiah(selectedProductDetail.price)}
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap pt-2 border-t border-outline-variant/20">
                                    {selectedProductDetail.description}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-outline-variant/20 flex gap-3">
                                <button
                                    onClick={() => {
                                        addToCart(selectedProductDetail);
                                        setSelectedProductDetail(null);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-bold text-xs hover:bg-surface-container transition"
                                >
                                    + Tambah Keranjang
                                </button>
                                <button
                                    onClick={() => {
                                        const p = selectedProductDetail;
                                        setSelectedProductDetail(null);
                                        startCheckout([{ ...p, quantity: 1 }]);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs hover:brightness-110 shadow-sm"
                                >
                                    Beli Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
