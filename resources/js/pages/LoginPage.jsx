import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function LoginPage({ setCurrentRoute }) {
    const { login, autoLoginDemo } = useAuth();
    const { showToast } = useCart();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState('');
    const [errorMsg, setErrorMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            await login(email, password);
            showToast('Login berhasil! Selamat datang kembali.');
            setCurrentRoute('dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setErrorMsg(
                err.response?.data?.message ||
                err.message ||
                'Email/Username atau password salah. Silakan coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role) => {
        setDemoLoading(role);
        setErrorMsg(null);
        try {
            await autoLoginDemo(role);
            showToast(`Masuk sebagai Demo ${role.charAt(0).toUpperCase() + role.slice(1)} berhasil!`);
            setCurrentRoute('dashboard');
        } catch (err) {
            setErrorMsg('Gagal masuk dengan akun demo.');
        } finally {
            setDemoLoading('');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-body-md text-on-background antialiased relative overflow-hidden items-center justify-center p-4">
            
            {/* Background Decor Elements (Stitch 1:1) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary/15 blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-primary/15 blur-[100px]" />
            </div>

            <div className="w-full max-w-[480px] z-10 relative my-8">
                
                {/* Brand Logo Header */}
                <div className="text-center mb-6">
                    <button onClick={() => setCurrentRoute('dashboard')} className="inline-block group">
                        <span className="font-extrabold text-3xl md:text-4xl tracking-tighter text-primary group-hover:opacity-80 transition-opacity">
                            Nexus Gaming
                        </span>
                    </button>
                    <p className="text-xs font-medium text-on-surface-variant mt-1">
                        The Ultimate Pro Marketplace
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 border border-outline-variant/30">
                    <div>
                        <h1 className="font-bold text-xl text-on-surface">Selamat Datang Kembali</h1>
                        <p className="text-xs text-on-surface-variant">Masuk untuk melanjutkan transaksi gaming Anda.</p>
                    </div>

                    {/* 1-Click Demo Accounts */}
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                            Akun Demo Cepat:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('buyer')}
                                disabled={demoLoading !== ''}
                                className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-center transition"
                            >
                                <span className="block text-[11px] font-bold text-primary">Pembeli</span>
                                <span className="block text-[9px] text-on-surface-variant">Saldo 2.5jt</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('seller')}
                                disabled={demoLoading !== ''}
                                className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-center transition"
                            >
                                <span className="block text-[11px] font-bold text-secondary">Penjual</span>
                                <span className="block text-[9px] text-on-surface-variant">Pro Store</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('admin')}
                                disabled={demoLoading !== ''}
                                className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 text-center transition"
                            >
                                <span className="block text-[11px] font-bold text-[#10B981]">Admin</span>
                                <span className="block text-[9px] text-on-surface-variant">Full Control</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 border-t border-outline-variant/30" />
                        <span className="relative bg-white px-3 text-[10px] text-outline uppercase font-medium">
                            atau dengan email
                        </span>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
                            {errorMsg}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Email or Username */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                                Email atau Username
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    mail
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com atau username"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-outline-variant text-primary focus:ring-primary"
                                />
                                <span>Ingat saya</span>
                            </label>
                            <button type="button" className="text-xs text-primary font-bold hover:underline">
                                Lupa Password?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || demoLoading !== ''}
                            className="w-full bg-primary hover:brightness-110 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Memverifikasi...' : 'Masuk ke Akun'}
                        </button>
                    </form>

                    {/* Footer link to register */}
                    <div className="text-center pt-2 text-xs text-on-surface-variant">
                        Belum punya akun?{' '}
                        <button
                            onClick={() => setCurrentRoute('signup')}
                            className="font-bold text-primary hover:underline"
                        >
                            Daftar gratis sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
