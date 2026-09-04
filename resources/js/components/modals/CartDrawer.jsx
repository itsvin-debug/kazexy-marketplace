import React from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CartDrawer() {
    const { 
        cartItems, 
        isCartOpen, 
        setIsCartOpen, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        cartTotal, 
        startCheckout 
    } = useCart();
    const { user } = useAuth();

    if (!isCartOpen) return null;

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white border-l border-outline-variant shadow-2xl flex flex-col">
                    
                    {/* Header */}
                    <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface text-base">Keranjang Belanja</h3>
                                <p className="text-xs text-on-surface-variant">{cartItems.length} item dipilih</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="p-1.5 rounded-full text-outline hover:text-on-surface transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                                <span className="material-symbols-outlined text-5xl text-outline">shopping_bag</span>
                                <p className="text-sm font-bold text-on-surface">Keranjang Anda Kosong</p>
                                <p className="text-xs text-on-surface-variant max-w-xs">
                                    Pilih produk game impianmu dan tambahkan ke sini.
                                </p>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex gap-3.5 items-center"
                                >
                                    <img 
                                        src={item.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80"} 
                                        alt={item.title}
                                        className="w-14 h-14 rounded-xl object-cover bg-surface-container-high shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs text-on-surface truncate">{item.title}</h4>
                                        <p className="text-[11px] text-on-surface-variant truncate">{item.game?.name || 'Game'}</p>
                                        <div className="font-bold text-xs text-primary mt-1">
                                            {formatRupiah(item.price)}
                                        </div>
                                    </div>

                                    {/* Qty & Remove */}
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-outline hover:text-error transition"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                        <div className="flex items-center gap-1.5 bg-white border border-outline-variant rounded-lg p-0.5">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-5 h-5 flex items-center justify-center text-xs text-on-surface hover:bg-surface-container rounded"
                                            >
                                                -
                                            </button>
                                            <span className="text-xs font-bold px-1">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-5 h-5 flex items-center justify-center text-xs text-on-surface hover:bg-surface-container rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer / Checkout Button */}
                    {cartItems.length > 0 && (
                        <div className="p-5 border-t border-outline-variant/30 bg-surface-container-low space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-on-surface-variant">Total Pembayaran:</span>
                                <span className="font-bold text-lg text-primary">{formatRupiah(cartTotal)}</span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={clearCart}
                                    className="py-2.5 px-3 rounded-xl border border-outline-variant text-outline hover:text-error text-xs font-bold"
                                >
                                    Kosongkan
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        startCheckout(cartItems);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold hover:brightness-110 shadow-md transition"
                                >
                                    Lanjut ke Pembayaran →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
