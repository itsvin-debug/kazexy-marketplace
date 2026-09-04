import React from 'react';

export default function Footer({ onSelectGame, onSelectCategory }) {
    return (
        <footer className="bg-surface-container border-t border-outline-variant/30 mt-16 text-on-surface-variant text-xs">
            
            {/* Value Props & Trust Badges */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-10 border-b border-outline-variant/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-2xl fill">verified_user</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-on-surface text-sm">100% Garansi Aman</h4>
                            <p className="text-[11px] text-on-surface-variant">Proteksi escrow sampai pesanan selesai</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-2xl fill">bolt</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-on-surface text-sm">Pengiriman Instan</h4>
                            <p className="text-[11px] text-on-surface-variant">Kode voucher & akun terkirim detik itu juga</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                            <span className="material-symbols-outlined text-2xl fill">account_balance_wallet</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-on-surface text-sm">NexusPay Terintegrasi</h4>
                            <p className="text-[11px] text-on-surface-variant">Top up mudah via QRIS & Virtual Account</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined text-2xl fill">support_agent</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-on-surface text-sm">Layanan 24/7</h4>
                            <p className="text-[11px] text-on-surface-variant">Tim gamer support siap membantu Anda</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links & Brand Info */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* Brand */}
                    <div className="space-y-3">
                        <div className="font-black text-xl text-primary">
                            Nexus Gaming
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Platform marketplace gaming nomor 1 Indonesia untuk jual beli akun, skin item, top up diamond, dan voucher game resmi terpercaya.
                        </p>
                        <p className="text-[11px] text-outline pt-2">
                            © 2026 Nexus Gaming Inc. All rights reserved.
                        </p>
                    </div>

                    {/* Populer Game */}
                    <div className="space-y-2.5">
                        <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Game Terpopuler</h4>
                        <ul className="space-y-1.5 text-xs">
                            <li><button onClick={() => onSelectGame?.('mobile-legends')} className="hover:text-primary transition">Mobile Legends</button></li>
                            <li><button onClick={() => onSelectGame?.('valorant')} className="hover:text-primary transition">Valorant</button></li>
                            <li><button onClick={() => onSelectGame?.('genshin-impact')} className="hover:text-primary transition">Genshin Impact</button></li>
                            <li><button onClick={() => onSelectGame?.('free-fire')} className="hover:text-primary transition">Free Fire</button></li>
                            <li><button onClick={() => onSelectGame?.('pubg-mobile')} className="hover:text-primary transition">PUBG Mobile</button></li>
                        </ul>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2.5">
                        <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Kategori Produk</h4>
                        <ul className="space-y-1.5 text-xs">
                            <li><button onClick={() => onSelectCategory?.('top-up')} className="hover:text-primary transition">Top Up Diamond & Cash</button></li>
                            <li><button onClick={() => onSelectCategory?.('akun-game')} className="hover:text-primary transition">Akun Game Sultan & Smurf</button></li>
                            <li><button onClick={() => onSelectCategory?.('item-skin')} className="hover:text-primary transition">Skin Senjata & Rare Items</button></li>
                            <li><button onClick={() => onSelectCategory?.('voucher-game')} className="hover:text-primary transition">Voucher Steam & Google Play</button></li>
                        </ul>
                    </div>

                    {/* Metode Pembayaran */}
                    <div className="space-y-2.5">
                        <h4 className="font-bold text-on-surface text-xs uppercase tracking-wider">Metode Pembayaran</h4>
                        <p className="text-[11px] text-on-surface-variant">
                            Mendukung QRIS, NexusPay, BCA, Mandiri, BNI, BRI, GoPay, OVO, ShopeePay, dan DANA.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-2.5 py-1 rounded bg-white border border-outline-variant text-[10px] font-bold text-on-surface">QRIS</span>
                            <span className="px-2.5 py-1 rounded bg-white border border-outline-variant text-[10px] font-bold text-on-surface">BCA</span>
                            <span className="px-2.5 py-1 rounded bg-white border border-outline-variant text-[10px] font-bold text-on-surface">MANDIRI</span>
                            <span className="px-2.5 py-1 rounded bg-white border border-outline-variant text-[10px] font-bold text-on-surface">DANA</span>
                            <span className="px-2.5 py-1 rounded bg-white border border-outline-variant text-[10px] font-bold text-on-surface">GOPAY</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
