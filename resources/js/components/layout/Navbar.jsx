import React, { useState, useRef, useEffect } from 'react';
import { 
    Gamepad2, 
    Search, 
    Heart, 
    ShoppingBag, 
    Wallet, 
    PlusCircle, 
    Store, 
    User as UserIcon, 
    LogOut, 
    Bell, 
    ChevronDown, 
    Sparkles, 
    ShieldCheck,
    Menu,
    X,
    Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar({ currentRoute, setCurrentRoute, onSearchChange, searchQuery, onOpenTopUp }) {
    const { user, logout, autoLoginDemo } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const demoRef = useRef(null);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (demoRef.current && !demoRef.current.contains(event.target)) {
                setIsDemoMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatRupiah = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
            {/* Top Notification / Banner Bar */}
            <div className="bg-gradient-to-r from-cyan-950/60 via-purple-950/40 to-slate-900 border-b border-cyan-500/10 px-4 py-1.5 text-xs text-slate-300 hidden md:flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> FLASH SALE 2026
                    </span>
                    <span className="text-slate-400">Garansi 100% Anti Hack-Back & Pengiriman Instan Otomatis 24/7</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <span className="hover:text-cyan-400 cursor-pointer transition">Bantuan 24/7</span>
                    <span>|</span>
                    <div className="relative" ref={demoRef}>
                        <button 
                            onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition"
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Mode Demo ({user ? user.role.toUpperCase() : 'PILIH'})</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>

                        {isDemoMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                                    Ganti Role Akun Demo
                                </div>
                                <button
                                    onClick={() => { autoLoginDemo('buyer'); setIsDemoMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                                >
                                    <span>Akun Pembeli (Buyer)</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Saldo 2.5jt</span>
                                </button>
                                <button
                                    onClick={() => { autoLoginDemo('seller'); setIsDemoMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                                >
                                    <span>Akun Penjual (Seller)</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">Pro Merchant</span>
                                </button>
                                <button
                                    onClick={() => { autoLoginDemo('admin'); setIsDemoMenuOpen(false); }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between transition"
                                >
                                    <span>Akun Admin</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Full Access</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                    
                    {/* Brand Logo */}
                    <div 
                        onClick={() => setCurrentRoute('dashboard')}
                        className="flex items-center gap-3 cursor-pointer group shrink-0"
                    >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                            <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
                                <Gamepad2 className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-white">NEXUS</span>
                                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-gradient-cyan">GAMING</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase hidden sm:block">Marketplace Jual Beli</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari akun MLBB, skin Valorant, Steam Wallet..."
                                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            {searchQuery && (
                                <button 
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
                        <button
                            onClick={() => setCurrentRoute('dashboard')}
                            className={`px-3.5 py-2 rounded-lg transition ${
                                currentRoute === 'dashboard'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            Marketplace
                        </button>
                        <button
                            onClick={() => setCurrentRoute('favorites')}
                            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition ${
                                currentRoute === 'favorites'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>Favorit</span>
                        </button>
                        <button
                            onClick={() => setCurrentRoute('transactions')}
                            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition ${
                                currentRoute === 'transactions'
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>Transaksi</span>
                        </button>
                        <button
                            onClick={() => setCurrentRoute('store')}
                            className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition ${
                                currentRoute === 'store'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                            }`}
                        >
                            <Store className="w-4 h-4 text-purple-400" />
                            <span>Toko Saya</span>
                        </button>
                    </nav>

                    {/* Right User & Cart Action Bar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        
                        {/* NexusPay Wallet Capsule */}
                        {user && (
                            <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 pl-3 gap-2">
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                                    <span className="text-slate-400 text-[11px]">Saldo:</span>
                                    <span className="font-bold text-white tracking-wide">{formatRupiah(user.balance)}</span>
                                </div>
                                <button
                                    onClick={onOpenTopUp}
                                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition"
                                >
                                    <PlusCircle className="w-3 h-3" />
                                    <span>Top Up</span>
                                </button>
                            </div>
                        )}

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition group"
                            title="Keranjang Belanja"
                        >
                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* User Profile / Auth State */}
                        {user ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 transition"
                                >
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || 'user'}`}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                                    />
                                    <div className="hidden xl:block text-left pr-1">
                                        <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{user.name}</div>
                                        <div className="text-[10px] text-cyan-400 leading-tight">{user.tier || 'VIP Gamer'}</div>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111622] border border-slate-700 shadow-2xl p-2 z-50">
                                        <div className="px-3 py-3 border-b border-slate-800 flex items-center gap-3">
                                            <img
                                                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username || 'user'}`}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                                            />
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-sm text-white truncate">{user.name}</div>
                                                <div className="text-xs text-slate-400 truncate">@{user.username || 'user'}</div>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                                    {user.tier}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="py-2 space-y-1">
                                            <button
                                                onClick={() => { setCurrentRoute('profile'); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition"
                                            >
                                                <UserIcon className="w-4 h-4 text-cyan-400" />
                                                <span>Profil Akun Saya</span>
                                            </button>
                                            <button
                                                onClick={() => { setCurrentRoute('favorites'); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition"
                                            >
                                                <Heart className="w-4 h-4 text-pink-400" />
                                                <span>Daftar Favorit</span>
                                            </button>
                                            <button
                                                onClick={() => { setCurrentRoute('transactions'); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition"
                                            >
                                                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                                                <span>Riwayat Transaksi</span>
                                            </button>
                                            <button
                                                onClick={() => { setCurrentRoute('store'); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-slate-800/80 text-slate-200 flex items-center gap-2.5 transition"
                                            >
                                                <Store className="w-4 h-4 text-purple-400" />
                                                <span>Manajemen Toko Saya</span>
                                            </button>
                                        </div>

                                        <div className="pt-2 border-t border-slate-800">
                                            <button
                                                onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-rose-500/20 text-rose-400 flex items-center gap-2.5 transition"
                                            >
                                                <LogOut className="w-4 h-4" />
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
                                    className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={() => setCurrentRoute('signup')}
                                    className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-lg shadow-cyan-500/25 transition"
                                >
                                    Daftar
                                </button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-700 lg:hidden text-slate-300"
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="pb-3 md:hidden">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari akun MLBB, skin Valorant..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-slate-800 space-y-2">
                        <button
                            onClick={() => { setCurrentRoute('dashboard'); setIsMobileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200"
                        >
                            Marketplace
                        </button>
                        <button
                            onClick={() => { setCurrentRoute('favorites'); setIsMobileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span>Daftar Favorit Saya</span>
                        </button>
                        <button
                            onClick={() => { setCurrentRoute('transactions'); setIsMobileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4 text-cyan-400" />
                            <span>Riwayat Transaksi</span>
                        </button>
                        <button
                            onClick={() => { setCurrentRoute('store'); setIsMobileMenuOpen(false); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                        >
                            <Store className="w-4 h-4 text-purple-400" />
                            <span>Manajemen Toko Saya</span>
                        </button>
                        {user && (
                            <button
                                onClick={() => { setCurrentRoute('profile'); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-200 flex items-center gap-2"
                            >
                                <UserIcon className="w-4 h-4 text-indigo-400" />
                                <span>Profil Pengguna</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
