import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function FavoritesPage({ setCurrentRoute }) {
    const { addToCart, startCheckout, showToast } = useCart();
    const { user } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchFavorites();
    }, [user]);

    const fetchFavorites = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get('/favorites');
            if (res.data.success) {
                setFavorites(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            const res = await api.delete(`/favorites/${productId}`);
            if (res.data.success) {
                setFavorites((prev) => prev.filter((item) => item.product_id !== productId));
                showToast('Item berhasil dihapus dari favorit.');
            }
        } catch (err) {
            console.error('Remove favorite error:', err);
        }
    };

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    const filteredFavorites = favorites.filter((fav) => {
        if (selectedCategory === 'all') return true;
        return fav.product?.category?.slug === selectedCategory;
    });

    return (
        <div className="space-y-6">
            
            {/* Header / Breadcrumbs (Stitch 1:1) */}
            <div className="space-y-2 pb-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span onClick={() => setCurrentRoute('dashboard')} className="cursor-pointer hover:text-primary">Beranda</span>
                    <span>/</span>
                    <span className="font-bold text-primary">Favorit</span>
                </div>
                <h1 className="font-extrabold text-2xl md:text-3xl text-on-surface tracking-tight">
                    Daftar Favorit Saya
                </h1>
                <p className="text-xs text-on-surface-variant">
                    Simpan item impianmu dan checkout kapan saja dengan harga terbaik.
                </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'all'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Semua ({favorites.length})
                </button>
                <button
                    onClick={() => setSelectedCategory('akun-game')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'akun-game'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Akun Game
                </button>
                <button
                    onClick={() => setSelectedCategory('item-skin')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'item-skin'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Item & Skin
                </button>
                <button
                    onClick={() => setSelectedCategory('top-up')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        selectedCategory === 'top-up'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Top Up
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-24 text-center text-on-surface-variant">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs">Memuat daftar favorit...</p>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-outline-variant/30 p-8 space-y-3">
                    <span className="material-symbols-outlined text-4xl text-outline">favorite_border</span>
                    <h3 className="font-bold text-base text-on-surface">Belum Ada Item Favorit</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                        Klik ikon hati pada produk di katalog untuk menyimpannya di sini.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={() => setCurrentRoute('dashboard')}
                            className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:brightness-110 shadow-sm"
                        >
                            Jelajahi Katalog Game
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFavorites.map((fav) => {
                        const product = fav.product;
                        if (!product) return null;

                        return (
                            <div
                                key={fav.id}
                                className="product-card bg-white rounded-[24px] overflow-hidden flex flex-col justify-between border border-outline-variant/20 relative"
                            >
                                {/* Thumbnail & Badges */}
                                <div className="aspect-[16/9] w-full overflow-hidden relative bg-surface-container-high">
                                    <img
                                        alt={product.title}
                                        className="w-full h-full object-cover"
                                        src={product.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                                    />
                                    <div className="absolute top-3 left-3 bg-secondary text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                                        {product.category?.name || 'Item'}
                                    </div>
                                    <div className="absolute top-3 right-3 bg-white/90 text-on-surface font-bold text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1 shadow-sm">
                                        <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-[#10B981]' : 'bg-error'}`} />
                                        <span>{product.stock > 0 ? 'Tersedia' : 'Habis'}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                                    <div>
                                        <h4 className="font-bold text-sm text-on-surface line-clamp-2">
                                            {product.title}
                                        </h4>
                                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">
                                            {product.description}
                                        </p>
                                    </div>

                                    {/* Price and Action Buttons */}
                                    <div className="flex items-end justify-between pt-2 border-t border-outline-variant/20">
                                        <div>
                                            <span className="text-[10px] text-outline block">Harga</span>
                                            <div className="font-bold text-base text-primary">
                                                {formatRupiah(product.price)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleRemove(product.id)}
                                                className="p-2 text-outline hover:text-error transition-colors"
                                                title="Hapus dari Favorit"
                                            >
                                                <span className="material-symbols-outlined text-[20px] text-error fill">delete</span>
                                            </button>
                                            <button
                                                onClick={() => startCheckout([{ ...product, quantity: 1 }])}
                                                className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs px-4 py-2 rounded-lg hover:brightness-110 shadow-sm transition-all"
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
        </div>
    );
}
