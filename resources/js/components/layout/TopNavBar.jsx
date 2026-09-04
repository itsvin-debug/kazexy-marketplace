import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function TopNavBar({
    currentRoute,
    setCurrentRoute,
    searchQuery,
    onSearchChange,
    onOpenTopUp,
    onOpenCreateStore,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
}) {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <header className="bg-surface shadow-sm sticky top-0 z-30 w-full border-b border-outline-variant/20">
            <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-[1280px] mx-auto h-20">
                
                {/* Brand & Sidebar Toggle Button */}
                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-on-surface-variant hover:text-primary rounded-lg"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    {/* Desktop Sidebar Toggle Icon */}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="hidden md:flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
                        title={isSidebarCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
                    >
                        <span className="material-symbols-outlined text-[22px]">
                            {isSidebarCollapsed ? 'side_navigation' : 'left_panel_close'}
                        </span>
                    </button>
                    
                    <div
                        onClick={() => setCurrentRoute('dashboard')}
                        className="font-black text-xl md:text-2xl text-primary tracking-tight cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <span>Nexus Gaming</span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl mx-4 md:mx-8 relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari item skin, akun ranked, atau top up game..."
                        className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2.5 pl-12 pr-4 text-xs font-medium text-on-surface placeholder-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Quick Navigation & Actions */}
                <div className="flex items-center gap-3 md:gap-5">
                    
                    {/* Store Action Button for Logged in user */}
                    {user && (
                        user.has_store ? (
                            <button
                                onClick={() => setCurrentRoute('store')}
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold hover:bg-secondary hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined text-[16px]">storefront</span>
                                <span>Toko Saya</span>
                            </button>
                        ) : (
                            <button
                                onClick={onOpenCreateStore}
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-secondary to-primary text-white text-xs font-bold shadow-sm hover:brightness-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-[16px]">add_business</span>
                                <span>Buat Toko</span>
                            </button>
                        )
                    )}

                    {/* Balance Capsule (If logged in) */}
                    {user && (
                        <div className="hidden xl:flex items-center bg-surface-container-low border border-outline-variant/40 rounded-full px-3 py-1.5 gap-2">
                            <span className="material-symbols-outlined text-[16px] text-primary">account_balance_wallet</span>
                            <span className="text-xs font-bold text-primary">{formatRupiah(user.balance)}</span>
                            <button
                                onClick={onOpenTopUp}
                                className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full hover:brightness-110"
                            >
                                + Top Up
                            </button>
                        </div>
                    )}

                    {/* Action Buttons: Cart, Notifications */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
                            title="Keranjang Belanja"
                        >
                            <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                            {cartCount > 0 && (
                                <span className="absolute 0 top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => {}}
                            className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container"
                            title="Notifikasi"
                        >
                            <span className="material-symbols-outlined text-[22px]">notifications</span>
                        </button>

                        {/* User Profile Avatar Dropdown OR Guest Login Buttons */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 transition"
                                >
                                    <img
                                        src={user.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + (user?.username || 'user')}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                                    />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-outline-variant shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-3 py-2 border-b border-outline-variant/30">
                                            <p className="font-bold text-xs text-on-surface">{user.name}</p>
                                            <p className="text-[11px] text-on-surface-variant font-mono">@{user.username}</p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-container/10 text-primary">
                                                    {user.tier || 'Nexus Member'}
                                                </span>
                                                {user.has_store && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">
                                                        Seller
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="py-2 space-y-1">
                                            <button
                                                onClick={() => { setCurrentRoute('profile'); setIsProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-container text-on-surface flex items-center gap-2 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                                <span>Pengaturan Akun & Saldo</span>
                                            </button>
                                            <button
                                                onClick={() => { setCurrentRoute('transactions'); setIsProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-container text-on-surface flex items-center gap-2 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                <span>Riwayat Transaksi</span>
                                            </button>
                                            <button
                                                onClick={() => { setCurrentRoute('favorites'); setIsProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-container text-on-surface flex items-center gap-2 font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">favorite</span>
                                                <span>Favorit Saya</span>
                                            </button>
                                            {user.has_store ? (
                                                <button
                                                    onClick={() => { setCurrentRoute('store'); setIsProfileOpen(false); }}
                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-surface-container text-secondary flex items-center gap-2 font-bold"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">storefront</span>
                                                    <span>Kelola Toko Saya</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { onOpenCreateStore(); setIsProfileOpen(false); }}
                                                    className="w-full text-left px-3 py-2 rounded-xl text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center gap-2 font-bold"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">add_business</span>
                                                    <span>Buka Toko Gratis</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-outline-variant/30">
                                            <button
                                                onClick={() => { logout(); setIsProfileOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error-container/30 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                                <span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentRoute('login')}
                                    className="px-3.5 py-1.5 text-xs font-bold text-primary hover:text-secondary border border-primary/20 rounded-xl hover:bg-primary/5 transition-all"
                                >
                                    Masuk
                                </button>
                                <button
                                    onClick={() => setCurrentRoute('signup')}
                                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:brightness-110 shadow-sm transition-all"
                                >
                                    Daftar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-surface-container border-b border-outline-variant p-4 space-y-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari item, akun, atau top up..."
                        className="w-full bg-white border border-outline-variant rounded-full py-2 px-4 text-xs mb-3"
                    />
                    <button
                        onClick={() => { setCurrentRoute('dashboard'); setIsMobileMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high"
                    >
                        Dashboard
                    </button>
                    {user && (
                        <>
                            <button
                                onClick={() => { setCurrentRoute('favorites'); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high"
                            >
                                Favorit
                            </button>
                            <button
                                onClick={() => { setCurrentRoute('transactions'); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high"
                            >
                                Transaksi
                            </button>
                            <button
                                onClick={() => { 
                                    if (user.has_store) {
                                        setCurrentRoute('store'); 
                                    } else {
                                        onOpenCreateStore();
                                    }
                                    setIsMobileMenuOpen(false); 
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high text-secondary flex items-center justify-between"
                            >
                                <span>{user.has_store ? 'Toko Saya' : 'Buka Toko Baru 🔒'}</span>
                            </button>
                            <button
                                onClick={() => { setCurrentRoute('profile'); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-high"
                            >
                                Akun Saya
                            </button>
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-error hover:bg-error-container/30"
                            >
                                Keluar (Logout)
                            </button>
                        </>
                    )}
                    {!user && (
                        <div className="pt-2 border-t border-outline-variant/30 flex gap-2">
                            <button
                                onClick={() => { setCurrentRoute('login'); setIsMobileMenuOpen(false); }}
                                className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg text-center"
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => { setCurrentRoute('signup'); setIsMobileMenuOpen(false); }}
                                className="flex-1 py-2 border border-primary text-primary text-xs font-bold rounded-lg text-center"
                            >
                                Daftar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
