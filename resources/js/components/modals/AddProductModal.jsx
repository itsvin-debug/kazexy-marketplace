import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function AddProductModal({ isOpen, onClose, productToEdit, onProductSaved, games = [], categories = [] }) {
    const { showToast } = useCart();

    const [form, setForm] = useState({
        title: '',
        game_id: '',
        category_id: '',
        description: '',
        price: '',
        original_price: '',
        stock: 1,
        delivery_type: 'instant',
        auto_delivery_data: '',
        image_url: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setForm({
                title: productToEdit.title || '',
                game_id: productToEdit.game_id || '',
                category_id: productToEdit.category_id || '',
                description: productToEdit.description || '',
                price: productToEdit.price || '',
                original_price: productToEdit.original_price || '',
                stock: productToEdit.stock || 1,
                delivery_type: productToEdit.delivery_type || 'instant',
                auto_delivery_data: productToEdit.auto_delivery_data || '',
                image_url: productToEdit.image_url || '',
            });
        } else {
            setForm({
                title: '',
                game_id: games[0]?.id || '',
                category_id: categories[0]?.id || '',
                description: '',
                price: '',
                original_price: '',
                stock: 1,
                delivery_type: 'instant',
                auto_delivery_data: '',
                image_url: '',
            });
        }
    }, [productToEdit, games, categories, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (productToEdit) {
                const res = await api.put(`/seller/products/${productToEdit.id}`, form);
                if (res.data.success) {
                    showToast('Produk berhasil diperbarui!');
                    onProductSaved?.();
                    onClose();
                }
            } else {
                const res = await api.post('/seller/products', form);
                if (res.data.success) {
                    showToast('Produk baru berhasil ditambahkan!');
                    onProductSaved?.();
                    onClose();
                }
            }
        } catch (err) {
            console.error('Save product error:', err);
            showToast('Gagal menyimpan produk. Periksa kembali form.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                    <h3 className="font-bold text-base text-on-surface">
                        {productToEdit ? 'Edit Barang Toko' : 'Tambah Barang Baru'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">Judul Produk</label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Contoh: Akun Valorant Full Skin Champion + Kuronami"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">Game</label>
                            <select
                                required
                                value={form.game_id}
                                onChange={(e) => setForm({ ...form, game_id: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            >
                                <option value="">Pilih Game</option>
                                {games.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">Kategori</label>
                            <select
                                required
                                value={form.category_id}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">Harga Jual (Rp)</label>
                            <input
                                type="number"
                                required
                                min="1000"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="150000"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface font-bold focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">Harga Coret (Opsi)</label>
                            <input
                                type="number"
                                value={form.original_price}
                                onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                                placeholder="200000"
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-1">Stok</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">URL Gambar (Opsional)</label>
                        <input
                            type="url"
                            value={form.image_url}
                            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">Tipe Pengiriman</label>
                        <select
                            value={form.delivery_type}
                            onChange={(e) => setForm({ ...form, delivery_type: e.target.value })}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        >
                            <option value="instant">⚡ Instan Otomatis (Data langsung terkirim setelah bayar)</option>
                            <option value="manual">📦 Manual (Penjual kirim data via chat)</option>
                        </select>
                    </div>

                    {form.delivery_type === 'instant' && (
                        <div>
                            <label className="block text-xs font-bold text-primary mb-1">
                                Data Akun / Kode Voucher Otomatis
                            </label>
                            <textarea
                                rows="3"
                                value={form.auto_delivery_data}
                                onChange={(e) => setForm({ ...form, auto_delivery_data: e.target.value })}
                                placeholder="Username: ...&#10;Password: ...&#10;Kode: ..."
                                className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">Deskripsi Lengkap</label>
                        <textarea
                            rows="3"
                            required
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Rincian level, status skin, garansi akun, dll..."
                            className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-primary hover:brightness-110 text-white font-bold text-xs shadow-md transition"
                        >
                            {loading ? 'Menyimpan...' : (productToEdit ? 'Simpan Perubahan' : '+ Pasang Produk Sekarang')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
