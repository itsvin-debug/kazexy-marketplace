import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CreateStoreModal({ isOpen, onClose, onStoreCreated }) {
    const { user, createStore } = useAuth();
    const { showToast } = useCart();

    const [formData, setFormData] = useState({
        store_name: '',
        store_category: 'items',
        store_description: '',
        store_contact: '',
        store_logo: '',
    });

    const [agreed, setAgreed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!agreed) {
            setError('Anda harus menyetujui Syarat & Ketentuan Merchant Nexus Gaming.');
            return;
        }

        if (formData.store_description.trim().length < 20) {
            setError('Deskripsi toko minimal 20 karakter agar pembeli memahami layanan Anda.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await createStore(formData);
            showToast('Selamat! Toko Anda berhasil dibuka. Menu Toko Saya sekarang aktif.', 'success');
            if (onStoreCreated) onStoreCreated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Gagal membuat toko.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-xl rounded-3xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-primary to-primary-container text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[24px]">storefront</span>
                            <h3 className="font-extrabold text-lg tracking-tight">Buka Toko Merchant Baru</h3>
                        </div>
                        <p className="text-xs text-white/80 mt-0.5">
                            Mulai berjualan item, akun, atau layanan top up game di Nexus Gaming
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Store Name */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                            Nama Toko / Lapak <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.store_name}
                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            placeholder="Contoh: Phoenix Gaming Store, TopUp Instan ID"
                            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <p className="text-[11px] text-on-surface-variant mt-1">
                            Nama toko akan tampil pada seluruh katalog produk Anda.
                        </p>
                    </div>

                    {/* Store Category */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                            Kategori Utama Produk <span className="text-error">*</span>
                        </label>
                        <select
                            value={formData.store_category}
                            onChange={(e) => setFormData({ ...formData, store_category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="items">Item In-Game (Skin, Senjata, Voucher)</option>
                            <option value="accounts">Akun Game (Ranked, High-End)</option>
                            <option value="topup">Top Up Otomatis (Diamond, VP, UC)</option>
                            <option value="jasa">Jasa Boost & Coaching</option>
                            <option value="all">Semua Kategori (General Gaming Merchant)</option>
                        </select>
                    </div>

                    {/* Store Description & Policy */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                            Deskripsi & Ketentuan Layanan Toko <span className="text-error">*</span>
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.store_description}
                            onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                            placeholder="Jelaskan garansi toko, jam operasional fast respond, ketentuan proses pengiriman akun/item..."
                            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                            Minimal 20 karakter.
                        </p>
                    </div>

                    {/* Store Contact / Emergency WhatsApp / Discord */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                            Kontak Toko / WhatsApp / Discord <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.store_contact}
                            onChange={(e) => setFormData({ ...formData, store_contact: e.target.value })}
                            placeholder="Contoh: WA: 08123456789 / Discord: merchant#1234"
                            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Store Logo (Optional) */}
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                            URL Logo / Banner Toko (Opsional)
                        </label>
                        <input
                            type="url"
                            value={formData.store_logo}
                            onChange={(e) => setFormData({ ...formData, store_logo: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Agreement Checkbox */}
                    <div className="pt-2 border-t border-outline-variant/30">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 rounded text-primary focus:ring-primary border-outline-variant"
                            />
                            <span className="text-xs text-on-surface-variant leading-relaxed">
                                Saya menyetujui <strong className="text-on-surface">Syarat & Ketentuan Merchant</strong> Nexus Gaming. Saya berkomitmen memberikan layanan jujur, garansi anti hackback, dan mematuhi regulasi transaksi aman.
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Memproses Toko...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    <span>Buka Toko Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
