import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function SignUpPage({ setCurrentRoute }) {
    const { register } = useAuth();
    const { showToast } = useCart();

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'buyer',
    });
    const [agreed, setAgreed] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) {
            setErrorMsg('Anda harus menyetujui Syarat & Ketentuan Nexus Gaming.');
            return;
        }
        if (formData.password !== formData.password_confirmation) {
            setErrorMsg('Konfirmasi password tidak cocok.');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            await register(formData);
            showToast('Registrasi Berhasil! Selamat datang di Nexus Gaming.');
            setCurrentRoute('dashboard');
        } catch (err) {
            console.error('Registration error:', err);
            setErrorMsg(err.response?.data?.message || err.message || 'Gagal mendaftar akun baru.');
        } finally {
            setLoading(false);
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
                
                {/* Logo / Brand Identity */}
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

                {/* Sign Up Card */}
                <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-5 border border-outline-variant/30">
                    <div>
                        <h1 className="font-bold text-xl text-on-surface">Buat Akun Baru</h1>
                        <p className="text-xs text-on-surface-variant">Bergabunglah dengan ribuan pro gamer lainnya.</p>
                    </div>

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="name">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    person
                                </span>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nama Lengkap Anda"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="username">
                                Username (GamerTag)
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    badge
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="GamerTag Anda"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    mail
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="email@contoh.com"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    lock
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength="6"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimal 6 karakter"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1" htmlFor="password_confirmation">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                    lock_reset
                                </span>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    minLength="6"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    placeholder="Ulangi password"
                                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-xs rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary input-glow transition-all"
                                />
                            </div>
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-start gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
                            />
                            <label htmlFor="terms" className="text-[11px] text-on-surface-variant leading-tight">
                                Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi Nexus Gaming.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:brightness-110 text-white font-bold text-xs py-3 rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>
                    </form>

                    {/* Footer link to login */}
                    <div className="text-center pt-2 text-xs text-on-surface-variant">
                        Sudah punya akun?{' '}
                        <button
                            onClick={() => setCurrentRoute('login')}
                            className="font-bold text-primary hover:underline"
                        >
                            Masuk di sini
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
