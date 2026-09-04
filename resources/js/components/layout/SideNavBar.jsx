import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SideNavBar({
    currentRoute,
    setCurrentRoute,
    onOpenTopUp,
    onOpenCreateStore,
    isCollapsed,
    setIsCollapsed,
}) {
    const { user, logout } = useAuth();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', requiresAuth: false },
        { id: 'favorites', label: 'Favorit', icon: 'favorite', requiresAuth: true },
        { id: 'transactions', label: 'Transaksi', icon: 'receipt_long', requiresAuth: true },
        { id: 'store', label: 'Toko Saya', icon: 'storefront', requiresStore: true },
        { id: 'profile', label: 'Akun', icon: 'person', requiresAuth: true },
    ];

    const handleNavClick = (item) => {
        if (item.requiresAuth && !user) {
            setCurrentRoute('login');
            return;
        }

        if (item.requiresStore) {
            if (!user) {
                setCurrentRoute('login');
                return;
            }
            if (!user.has_store) {
                if (onOpenCreateStore) onOpenCreateStore();
                return;
            }
        }

        setCurrentRoute(item.id);
    };

    return (
        <aside
            className={`hidden md:flex flex-col bg-surface-container fixed left-0 top-0 h-screen shadow-md border-r border-outline-variant/20 z-40 transition-all duration-300 ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div className="flex flex-col py-5 flex-grow justify-between h-full overflow-y-auto">
                
                {/* Header with Collapse Toggle */}
                <div>
                    <div className={`px-4 mb-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isCollapsed && (
                            <div
                                onClick={() => setCurrentRoute('dashboard')}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">sports_esports</span>
                                </div>
                                <span className="font-extrabold text-base text-primary tracking-tight">
                                    Nexus
                                </span>
                            </div>
                        )}
                        
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                            title={isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {isCollapsed ? 'menu_open' : 'menu'}
                            </span>
                        </button>
                    </div>

                    {/* User Profile Header in Sidebar */}
                    <div className={`px-4 mb-4 ${isCollapsed ? 'text-center' : ''}`}>
                        {user ? (
                            <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'flex-col items-center text-center'} p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30`}>
                                <div className="relative mb-2">
                                    <img
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-sm"
                                        src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + (user?.username || 'user')}
                                    />
                                    {user.has_store && (
                                        <span
                                            title="Verified Merchant"
                                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary text-white flex items-center justify-center text-[11px] shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-[12px]">store</span>
                                        </span>
                                    )}
                                </div>

                                {!isCollapsed && (
                                    <>
                                        <h2 className="font-bold text-xs text-primary leading-tight truncate max-w-[180px]">
                                            {user.name}
                                        </h2>
                                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">
                                            {user?.tier || 'Nexus Member'}
                                        </p>
                                        
                                        <button
                                            onClick={onOpenTopUp}
                                            className="mt-2.5 w-full py-1.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-[11px] rounded-lg shadow-sm hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">add_circle</span>
                                            <span>Top Up Saldo</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : (
                            !isCollapsed ? (
                                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-center space-y-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">account_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-on-surface">Mode Tamu (Guest)</p>
                                        <p className="text-[10px] text-on-surface-variant">Masuk untuk belanja & kelola pesanan</p>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={() => setCurrentRoute('login')}
                                            className="flex-1 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:brightness-110"
                                        >
                                            Masuk
                                        </button>
                                        <button
                                            onClick={() => setCurrentRoute('signup')}
                                            className="flex-1 py-1.5 border border-primary text-primary text-[11px] font-bold rounded-lg hover:bg-primary/5"
                                        >
                                            Daftar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setCurrentRoute('login')}
                                    className="w-10 h-10 rounded-full bg-primary text-white mx-auto flex items-center justify-center"
                                    title="Masuk Akun"
                                >
                                    <span className="material-symbols-outlined text-[18px]">login</span>
                                </button>
                            )
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-1 px-3">
                        {navItems.map((item) => {
                            const isActive = currentRoute === item.id;
                            const isStoreLocked = item.requiresStore && user && !user.has_store;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item)}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all text-left relative ${
                                        isActive
                                            ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                                            : isStoreLocked
                                            ? 'text-on-surface-variant/70 hover:bg-surface-container-high'
                                            : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                >
                                    <span
                                        className={`material-symbols-outlined text-[20px] ${isActive ? 'fill' : ''}`}
                                    >
                                        {item.icon}
                                    </span>
                                    
                                    {!isCollapsed && (
                                        <span className="flex-1 truncate">{item.label}</span>
                                    )}

                                    {/* Locked Icon for Store */}
                                    {!isCollapsed && isStoreLocked && (
                                        <span
                                            title="Toko Terkunci — Klik untuk Buat Toko"
                                            className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md"
                                        >
                                            <span className="material-symbols-outlined text-[13px]">lock</span>
                                            <span>Kunci</span>
                                        </span>
                                    )}

                                    {isCollapsed && isStoreLocked && (
                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Store Unlock CTA Banner (if logged in but has no store) */}
                        {!isCollapsed && user && !user.has_store && (
                            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 border border-secondary/20">
                                <div className="flex items-center gap-2 text-secondary font-bold text-[11px]">
                                    <span className="material-symbols-outlined text-[16px]">storefront</span>
                                    <span>Mau Jualan Game?</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant mt-1 leading-snug">
                                    Buka tokomu sekarang untuk mulai menjual item & akun.
                                </p>
                                <button
                                    onClick={onOpenCreateStore}
                                    className="mt-2 w-full py-1.5 bg-secondary text-white font-bold text-[11px] rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
                                    <span>Buat Toko Saya</span>
                                </button>
                            </div>
                        )}
                    </nav>
                </div>

                {/* Bottom Section: Help & Logout (Only visible if logged in) */}
                <div className="px-3 pt-3 border-t border-outline-variant/20 space-y-1">
                    <button
                        onClick={() => setCurrentRoute('dashboard')}
                        title={isCollapsed ? 'Bantuan' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-on-surface-variant hover:bg-surface-container-highest transition-colors ${
                            isCollapsed ? 'justify-center' : ''
                        }`}
                    >
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        {!isCollapsed && <span>Bantuan & FAQ</span>}
                    </button>

                    {user && (
                        <button
                            onClick={logout}
                            title={isCollapsed ? 'Keluar (Logout)' : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error-container/30 transition-colors ${
                                isCollapsed ? 'justify-center' : ''
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            {!isCollapsed && <span>Keluar (Logout)</span>}
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
