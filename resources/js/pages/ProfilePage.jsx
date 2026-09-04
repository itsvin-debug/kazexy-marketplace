import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProfilePage({ onOpenTopUp }) {
    const { user, updateProfile, updatePassword } = useAuth();
    const { showToast } = useCart();

    const [activeTab, setActiveTab] = useState('profile'); // profile, payment, wallet, games, security
    const [loading, setLoading] = useState(false);

    // Profile Form
    const [profileForm, setProfileForm] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        bio: '',
        discord_id: '',
        riot_id: '',
        steam_id: '',
        moonton_id: '',
    });

    // Password Form
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    // Payment Methods state
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        provider: 'dana',
        account_number: '',
        account_name: '',
    });

    // OTP Modal & Verification State
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpData, setOtpData] = useState({
        binding_reference_id: '',
        provider: 'dana',
        masked_phone: '',
        otp_hint: '',
        account_name: '',
    });
    const [otpInput, setOtpInput] = useState('');
    const [otpTimer, setOtpTimer] = useState(60);
    const [otpSubmitting, setOtpSubmitting] = useState(false);
    const [otpResending, setOtpResending] = useState(false);
    const [otpError, setOtpError] = useState('');

    // Wallet History state
    const [walletHistory, setWalletHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        let interval = null;
        if (otpModalOpen && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpModalOpen, otpTimer]);

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                bio: user.bio || '',
                discord_id: user.discord_id || '',
                riot_id: user.riot_id || '',
                steam_id: user.steam_id || '',
                moonton_id: user.moonton_id || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'wallet') {
            fetchWalletTransactions();
        } else if (activeTab === 'payment') {
            fetchPaymentMethods();
        }
    }, [activeTab]);

    const fetchPaymentMethods = async () => {
        setPaymentLoading(true);
        try {
            const res = await api.get('/payment-methods');
            if (res.data.success) {
                setPaymentMethods(res.data.data || []);
            }
        } catch (err) {
            console.error('Fetch payment methods error:', err);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handleAddPaymentMethod = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOtpError('');
        try {
            const isEwallet = ['dana', 'ovo', 'gopay', 'shopeepay'].includes(newPayment.provider);
            if (isEwallet) {
                const res = await api.post('/payment-methods/bind', newPayment);
                if (res.data.success) {
                    setOtpData({
                        binding_reference_id: res.data.binding_reference_id,
                        provider: newPayment.provider,
                        masked_phone: res.data.masked_phone,
                        otp_hint: res.data.otp_hint,
                        account_name: newPayment.account_name,
                    });
                    setOtpInput('');
                    setOtpTimer(60);
                    setOtpModalOpen(true);
                    showToast(res.data.message || 'Kode OTP telah dikirimkan ke nomor e-wallet Anda.');
                }
            } else {
                const res = await api.post('/payment-methods', newPayment);
                if (res.data.success) {
                    showToast('Rekening bank berhasil ditambahkan!');
                    setNewPayment({ provider: 'dana', account_number: '', account_name: '' });
                    setIsAddPaymentOpen(false);
                    fetchPaymentMethods();
                }
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal memproses pengaitan pembayaran.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        if (!otpInput || otpInput.trim().length !== 6) {
            setOtpError('Harap masukkan 6 digit kode OTP verifikasi.');
            return;
        }
        setOtpSubmitting(true);
        setOtpError('');
        try {
            const res = await api.post('/payment-methods/verify-otp', {
                binding_reference_id: otpData.binding_reference_id,
                otp: otpInput.trim(),
            });
            if (res.data.success) {
                showToast(res.data.message || 'Akun e-wallet berhasil terhubung!');
                setOtpModalOpen(false);
                setNewPayment({ provider: 'dana', account_number: '', account_name: '' });
                setIsAddPaymentOpen(false);
                fetchPaymentMethods();
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Kode OTP salah atau telah kadaluarsa.';
            setOtpError(errMsg);
            showToast(errMsg, 'error');
        } finally {
            setOtpSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (otpTimer > 0 || otpResending) return;
        setOtpResending(true);
        setOtpError('');
        try {
            const res = await api.post('/payment-methods/resend-otp', {
                binding_reference_id: otpData.binding_reference_id,
            });
            if (res.data.success) {
                showToast('Kode OTP baru telah berhasil dikirimkan!');
                setOtpTimer(60);
                if (res.data.otp_hint) {
                    setOtpData((prev) => ({ ...prev, otp_hint: res.data.otp_hint }));
                }
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Gagal mengirim ulang OTP.', 'error');
        } finally {
            setOtpResending(false);
        }
    };

    const [refreshingBalanceId, setRefreshingBalanceId] = useState(null);

    const handleRefreshBalance = async (id) => {
        setRefreshingBalanceId(id);
        try {
            const res = await api.post(`/payment-methods/${id}/refresh-balance`);
            if (res.data.success) {
                showToast(res.data.message || 'Saldo e-wallet berhasil disinkronkan!');
                fetchPaymentMethods();
            }
        } catch (err) {
            showToast('Gagal menyinkronkan saldo e-wallet.', 'error');
        } finally {
            setRefreshingBalanceId(null);
        }
    };

    const handleResumePendingOtp = (method) => {
        setOtpData({
            binding_reference_id: method.binding_reference_id,
            provider: method.provider,
            masked_phone: method.masked_phone || method.account_number,
            otp_hint: method.otp_hint || '123456',
            account_name: method.account_name,
        });
        setOtpInput('');
        setOtpTimer(60);
        setOtpError('');
        setOtpModalOpen(true);
    };

    const handleSetPrimaryPayment = async (id) => {
        try {
            const res = await api.patch(`/payment-methods/${id}/set-primary`);
            if (res.data.success) {
                showToast('Metode pembayaran utama diperbarui!');
                fetchPaymentMethods();
            }
        } catch (err) {
            showToast('Gagal mengubah metode utama.', 'error');
        }
    };

    const handleDeletePaymentMethod = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) return;
        try {
            const res = await api.delete(`/payment-methods/${id}`);
            if (res.data.success) {
                showToast('Metode pembayaran berhasil dihapus.');
                fetchPaymentMethods();
            }
        } catch (err) {
            showToast('Gagal menghapus metode pembayaran.', 'error');
        }
    };

    const fetchWalletTransactions = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/wallet/transactions');
            if (res.data.success) {
                setWalletHistory(res.data.data.data || []);
            }
        } catch (err) {
            console.error('Wallet history error:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(profileForm);
            showToast('Profil Anda berhasil diperbarui!');
        } catch (err) {
            console.error('Profile update error:', err);
            showToast(err.message || 'Gagal memperbarui profil.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            showToast('Konfirmasi password baru tidak cocok.', 'error');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(
                passwordForm.current_password,
                passwordForm.new_password,
                passwordForm.new_password_confirmation
            );
            showToast('Password berhasil diganti!');
            setPasswordForm({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (err) {
            console.error('Password update error:', err);
            showToast(err.response?.data?.message || 'Gagal mengubah password.', 'error');
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

    const getProviderBadge = (provider) => {
        const p = provider.toLowerCase();
        if (p === 'dana') return { label: 'DANA', bg: 'bg-[#118EEA] text-white', icon: 'account_balance_wallet' };
        if (p === 'ovo') return { label: 'OVO', bg: 'bg-[#4C2A86] text-white', icon: 'wallet' };
        if (p === 'gopay') return { label: 'GoPay', bg: 'bg-[#00AA13] text-white', icon: 'account_balance_wallet' };
        if (p === 'shopeepay') return { label: 'ShopeePay', bg: 'bg-[#EE4D2D] text-white', icon: 'shopping_bag' };
        if (p === 'bca') return { label: 'Bank BCA', bg: 'bg-[#003B70] text-white', icon: 'account_balance' };
        if (p === 'mandiri') return { label: 'Bank Mandiri', bg: 'bg-[#003D79] text-white', icon: 'account_balance' };
        if (p === 'bni') return { label: 'Bank BNI', bg: 'bg-[#F15A24] text-white', icon: 'account_balance' };
        if (p === 'bri') return { label: 'Bank BRI', bg: 'bg-[#00529C] text-white', icon: 'account_balance' };
        return { label: provider.toUpperCase(), bg: 'bg-primary text-white', icon: 'credit_card' };
    };

    if (!user) {
        return (
            <div className="py-24 text-center text-on-surface-variant">
                <p>Silakan login terlebih dahulu untuk mengakses profil pengguna.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* User Profile Header Card (Stitch 1:1) */}
            <div className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <img
                        alt="Gaming Profile Avatar"
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary object-cover shadow-sm bg-surface-container"
                        src={user.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + (user.username || 'user')}
                    />
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-extrabold text-xl md:text-2xl text-on-surface">
                                {user.name}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-container/10 text-primary">
                                {user.tier || 'Nexus Member'}
                            </span>
                            {user.has_store && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary border border-secondary/20">
                                    Merchant
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-on-surface-variant font-mono">@{user.username}</p>
                        <p className="text-xs text-on-surface-variant max-w-md pt-1">
                            {user.bio || 'Gamer enthusiast di Nexus Gaming. Koleksi item & skins.'}
                        </p>
                    </div>
                </div>

                {/* Balance & Top Up Box */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between gap-4 w-full md:w-auto">
                    <div>
                        <span className="text-[10px] text-outline font-bold uppercase block">Saldo NexusPay</span>
                        <span className="text-lg font-bold text-primary">{formatRupiah(user.balance)}</span>
                    </div>
                    <button
                        onClick={onOpenTopUp}
                        className="bg-primary hover:brightness-110 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                    >
                        + Top Up Saldo
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        activeTab === 'profile'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Informasi Profil
                </button>
                <button
                    onClick={() => setActiveTab('payment')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === 'payment'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px]">credit_card</span>
                    <span>Metode Pembayaran</span>
                </button>
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        activeTab === 'wallet'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    NexusPay & Mutasi
                </button>
                <button
                    onClick={() => setActiveTab('games')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        activeTab === 'games'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Akun Game Terhubung
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`px-5 py-2 rounded-full font-medium text-xs transition-all whitespace-nowrap ${
                        activeTab === 'security'
                            ? 'bg-primary text-white font-bold shadow-sm'
                            : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                >
                    Keamanan Password
                </button>
            </div>

            {/* Tab 1: Profile Information */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-5">
                    <h3 className="font-bold text-base text-on-surface">Ubah Informasi Pengguna</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Username</label>
                            <input
                                type="text"
                                required
                                value={profileForm.username}
                                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Email</label>
                            <input
                                type="email"
                                disabled
                                value={profileForm.email}
                                className="w-full bg-surface-container-high border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface-variant/60 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Nomor Telepon / WhatsApp</label>
                            <input
                                type="text"
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                placeholder="081234567890"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Bio</label>
                        <textarea
                            rows="3"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            placeholder="Deskripsi singkat profil gamer Anda..."
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:brightness-110 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            )}

            {/* Tab: Payment Methods (Metode Pembayaran) */}
            {activeTab === 'payment' && (
                <div className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-base text-on-surface">Metode Pembayaran Terhubung</h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                                Kaitkan akun e-wallet (DANA, OVO, GoPay, ShopeePay) atau rekening Bank untuk pembayaran instan & verifikasi transaksi.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddPaymentOpen(!isAddPaymentOpen)}
                            className="bg-primary hover:brightness-110 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {isAddPaymentOpen ? 'close' : 'add'}
                            </span>
                            <span>{isAddPaymentOpen ? 'Tutup Form' : 'Kaitkan Metode Baru'}</span>
                        </button>
                    </div>

                    {/* Add Payment Method Form */}
                    {isAddPaymentOpen && (
                        <form
                            onSubmit={handleAddPaymentMethod}
                            className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-4 animate-in fade-in duration-200"
                        >
                            <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">add_card</span>
                                <span>Form Pengaitan Pembayaran Baru</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Pilih Provider</label>
                                    <select
                                        value={newPayment.provider}
                                        onChange={(e) => setNewPayment({ ...newPayment, provider: e.target.value })}
                                        className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                                    >
                                        <option value="dana">DANA (E-Wallet)</option>
                                        <option value="gopay">GoPay (E-Wallet)</option>
                                        <option value="ovo">OVO (E-Wallet)</option>
                                        <option value="shopeepay">ShopeePay (E-Wallet)</option>
                                        <option value="bca">Bank BCA</option>
                                        <option value="mandiri">Bank Mandiri</option>
                                        <option value="bni">Bank BNI</option>
                                        <option value="bri">Bank BRI</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-on-surface">
                                            {['dana', 'ovo', 'gopay', 'shopeepay'].includes(newPayment.provider) ? 'Nomor HP E-Wallet' : 'Nomor Rekening Bank'}
                                        </label>
                                        {['dana', 'ovo', 'gopay', 'shopeepay'].includes(newPayment.provider) && (
                                            <span className="text-[10px] text-primary font-bold">Hanya Angka (08...)</span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={14}
                                            required
                                            placeholder={['dana', 'ovo', 'gopay', 'shopeepay'].includes(newPayment.provider) ? "Contoh: 081234567890" : "123456789"}
                                            value={newPayment.account_number}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setNewPayment({ ...newPayment, account_number: val });
                                            }}
                                            className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    {['dana', 'ovo', 'gopay', 'shopeepay'].includes(newPayment.provider) && newPayment.account_number && !newPayment.account_number.startsWith('08') && (
                                        <p className="text-[10px] text-error font-semibold">Nomor e-wallet harus diawali dengan 08</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface">Nama Pemilik Akun</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Sesuai nama di aplikasi / rekening"
                                        value={newPayment.account_name}
                                        onChange={(e) => setNewPayment({ ...newPayment, account_name: e.target.value })}
                                        className="w-full bg-white border border-outline-variant rounded-xl px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddPaymentOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-primary hover:brightness-110 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm"
                                >
                                    Kaitkan Sekarang
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Linked Payment Methods List */}
                    {paymentLoading ? (
                        <div className="py-12 text-center text-on-surface-variant text-xs">Memuat metode pembayaran...</div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-outline-variant text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                                <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-on-surface">Belum Ada Metode Pembayaran</p>
                                <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                                    Kaitkan minimal 1 metode pembayaran (DANA, OVO, GoPay, BCA, dll.) dengan verifikasi OTP resmi agar akun Anda dapat melakukan transaksi dengan aman.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddPaymentOpen(true)}
                                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:brightness-110 shadow-sm"
                            >
                                + Tambah Metode Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {paymentMethods.map((method) => {
                                const badge = getProviderBadge(method.provider);
                                const isLinked = method.binding_status === 'LINKED' || method.is_linked;
                                const isPending = method.binding_status === 'PENDING_OTP';

                                return (
                                    <div
                                        key={method.id}
                                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                                            method.is_primary && isLinked
                                                ? 'bg-gradient-to-br from-primary/5 via-white to-secondary/5 border-primary/40 shadow-sm ring-1 ring-primary/30'
                                                : isPending
                                                ? 'bg-amber-500/5 border-amber-300'
                                                : 'bg-white border-outline-variant/30 hover:border-outline-variant'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl ${badge.bg} flex items-center justify-center shadow-sm`}>
                                                        <span className="material-symbols-outlined text-[20px]">{badge.icon}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm text-on-surface">{badge.label}</h4>
                                                            {method.is_primary && isLinked && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white">
                                                                    Utama
                                                                </span>
                                                            )}
                                                            {isLinked ? (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[12px]">verified_user</span>
                                                                    <span>Terverifikasi</span>
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[12px]">pending</span>
                                                                    <span>Menunggu OTP</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-mono font-bold text-on-surface mt-0.5">
                                                            {method.masked_phone || method.account_number}
                                                        </p>
                                                        <p className="text-[11px] text-on-surface-variant">a.n. {method.account_name}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeletePaymentMethod(method.id)}
                                                    className="p-1.5 text-on-surface-variant hover:text-error rounded-lg hover:bg-error-container/30 transition-colors"
                                                    title="Hapus Metode"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>

                                            {/* Live Balance Container for Linked E-Wallets */}
                                            {isLinked && (
                                                <div className="mt-3.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Saldo E-Wallet Terhubung</p>
                                                            <p className="text-sm font-extrabold text-on-surface font-mono">
                                                                Rp {Number(method.balance || 0).toLocaleString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRefreshBalance(method.id)}
                                                        disabled={refreshingBalanceId === method.id}
                                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                                                        title="Sinkronkan Saldo E-Wallet"
                                                    >
                                                        <span className={`material-symbols-outlined text-[16px] ${refreshingBalanceId === method.id ? 'animate-spin' : ''}`}>
                                                            sync
                                                        </span>
                                                        <span className="hidden sm:inline">Cek Saldo</span>
                                                    </button>
                                                </div>
                                            )}

                                            {isPending && (
                                                <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                                                    <span className="text-amber-800 text-[11px]">Akun belum aktif. Selesaikan verifikasi OTP resmi.</span>
                                                    <button
                                                        onClick={() => handleResumePendingOtp(method)}
                                                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shadow-sm"
                                                    >
                                                        Input OTP
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {!method.is_primary && isLinked && (
                                            <div className="pt-3 mt-3 border-t border-outline-variant/20 flex justify-end">
                                                <button
                                                    onClick={() => handleSetPrimaryPayment(method.id)}
                                                    className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">star</span>
                                                    <span>Jadikan Metode Utama</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* OTP Verification Modal (Secure Account Binding) */}
            {otpModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl border border-outline-variant/30 space-y-5 animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-inner">
                                <span className="material-symbols-outlined text-[32px]">lock_person</span>
                            </div>
                            <h3 className="font-extrabold text-lg text-on-surface">Verifikasi Akun E-Wallet</h3>
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Kode verifikasi OTP resmi 6-digit telah dikirimkan ke nomor e-wallet{' '}
                                <span className="font-bold text-on-surface uppercase">{otpData.provider}</span>:
                                <br />
                                <span className="font-mono font-bold text-primary text-sm">{otpData.masked_phone}</span>{' '}
                                <span className="text-[11px]">({otpData.account_name})</span>
                            </p>
                        </div>

                        {/* Sandbox OTP Helper Badge */}
                        {otpData.otp_hint && (
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600 text-[18px]">verified</span>
                                    <div className="text-left">
                                        <p className="text-[11px] font-semibold text-blue-900">OTP Simulasi Sandbox:</p>
                                        <p className="text-xs font-mono font-bold text-blue-700 tracking-wider">{otpData.otp_hint}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOtpInput(otpData.otp_hint)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                                >
                                    Isi Otomatis
                                </button>
                            </div>
                        )}

                        {/* OTP Input Form */}
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-center text-on-surface mb-2">
                                    Masukkan 6 Digit Kode OTP
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    autoFocus
                                    placeholder="• • • • • •"
                                    value={otpInput}
                                    onChange={(e) => {
                                        setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                                        setOtpError('');
                                    }}
                                    className={`w-full text-center text-2xl font-mono font-bold tracking-[0.5em] py-3 rounded-xl border bg-surface-container-lowest focus:outline-none transition-all ${
                                        otpError
                                            ? 'border-error ring-2 ring-error/20 text-error'
                                            : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface'
                                    }`}
                                />
                                {otpError && (
                                    <p className="text-[11px] font-semibold text-error text-center mt-1.5 flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">error</span>
                                        <span>{otpError}</span>
                                    </p>
                                )}
                            </div>

                            {/* Resend Timer */}
                            <div className="text-center text-xs">
                                {otpTimer > 0 ? (
                                    <p className="text-on-surface-variant">
                                        Kirim ulang kode dalam{' '}
                                        <span className="font-mono font-bold text-primary">
                                            00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                                        </span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={otpResending}
                                        onClick={handleResendOtp}
                                        className="font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                                    >
                                        {otpResending ? 'Mengirim ulang...' : 'Kirim Ulang Kode OTP'}
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpModalOpen(false);
                                        fetchPaymentMethods();
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
                                >
                                    Nanti Saja
                                </button>
                                <button
                                    type="submit"
                                    disabled={otpSubmitting || otpInput.length !== 6}
                                    className="flex-1 py-2.5 rounded-xl bg-primary hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all"
                                >
                                    {otpSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                            <span>Memverifikasi...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px]">lock_open</span>
                                            <span>Verifikasi & Kaitkan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tab 2: Wallet & Mutations */}
            {activeTab === 'wallet' && (
                <div className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-base text-on-surface">Riwayat Mutasi Saldo</h3>
                            <p className="text-xs text-on-surface-variant">Transaksi top up dan pembayaran.</p>
                        </div>
                        <button
                            onClick={onOpenTopUp}
                            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:brightness-110 shadow-sm"
                        >
                            + Top Up Saldo
                        </button>
                    </div>

                    {historyLoading ? (
                        <div className="py-12 text-center text-on-surface-variant text-xs">Memuat mutasi...</div>
                    ) : walletHistory.length === 0 ? (
                        <div className="py-12 text-center text-on-surface-variant text-xs">Belum ada transaksi saldo.</div>
                    ) : (
                        <div className="space-y-2.5">
                            {walletHistory.map((trx) => {
                                const isPos = trx.type === 'topup' || trx.type === 'payout';
                                return (
                                    <div
                                        key={trx.id}
                                        className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex justify-between items-center text-xs"
                                    >
                                        <div>
                                            <p className="font-bold text-on-surface">{trx.description}</p>
                                            <p className="text-[11px] text-on-surface-variant">{formatDate(trx.created_at)}</p>
                                        </div>
                                        <span className={`font-bold text-sm ${isPos ? 'text-[#10B981]' : 'text-error'}`}>
                                            {isPos ? '+' : ''}{formatRupiah(trx.amount)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Connected Game Accounts */}
            {activeTab === 'games' && (
                <form onSubmit={handleSaveProfile} className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-5">
                    <div>
                        <h3 className="font-bold text-base text-on-surface">Hubungkan Akun Game</h3>
                        <p className="text-xs text-on-surface-variant">Data untuk mempermudah transaksi item & joki rank.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Riot ID (Valorant)</label>
                            <input
                                type="text"
                                value={profileForm.riot_id}
                                onChange={(e) => setProfileForm({ ...profileForm, riot_id: e.target.value })}
                                placeholder="RezaGod#ID1"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Steam ID 64</label>
                            <input
                                type="text"
                                value={profileForm.steam_id}
                                onChange={(e) => setProfileForm({ ...profileForm, steam_id: e.target.value })}
                                placeholder="76561198001122334"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Moonton ID & Server (MLBB)</label>
                            <input
                                type="text"
                                value={profileForm.moonton_id}
                                onChange={(e) => setProfileForm({ ...profileForm, moonton_id: e.target.value })}
                                placeholder="88992211 (2041)"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-on-surface">Discord Tag</label>
                            <input
                                type="text"
                                value={profileForm.discord_id}
                                onChange={(e) => setProfileForm({ ...profileForm, discord_id: e.target.value })}
                                placeholder="username#0000"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:brightness-110 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
                        >
                            Simpan Akun Game
                        </button>
                    </div>
                </form>
            )}

            {/* Tab 4: Security */}
            {activeTab === 'security' && (
                <form onSubmit={handleSavePassword} className="bg-white rounded-[24px] p-6 md:p-8 border border-outline-variant/20 shadow-sm space-y-4 max-w-lg">
                    <div>
                        <h3 className="font-bold text-base text-on-surface">Ganti Password</h3>
                        <p className="text-xs text-on-surface-variant">Pastikan password baru Anda aman.</p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Password Saat Ini</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Password Baru</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordForm.new_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface">Ulangi Password Baru</label>
                        <input
                            type="password"
                            required
                            minLength="6"
                            value={passwordForm.new_password_confirmation}
                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:brightness-110 text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-sm"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
