import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CreditCard, Banknote, TrendingDown, Plus } from 'lucide-react';
import api from '../services/api';
import type { Siparis, Odeme, Gider } from '../types';
import GiderEkleModal from '../components/modals/GiderEkleModal';

const NakitAkisi: React.FC = () => {
    const navigate = useNavigate();
    const [siparisler, setSiparisler] = useState<Siparis[]>([]);
    const [odemeler, setOdemeler] = useState<Odeme[]>([]);
    const [giderler, setGiderler] = useState<Gider[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);
    const [filtre, setFiltre] = useState<'gunluk' | 'haftalik' | 'aylik'>('gunluk');
    const [giderModalAcik, setGiderModalAcik] = useState(false);

    const verileriGetir = async () => {
        try {
            setYukleniyor(true);
            const [siparislerYanit, odemelerYanit, giderlerYanit] = await Promise.all([
                api.get<Siparis[]>('/siparisler'),
                api.get<Odeme[]>('/odemeler'),
                api.get<Gider[]>('/giderler'),
            ]);
            setSiparisler(siparislerYanit.data);
            setOdemeler(odemelerYanit.data);
            setGiderler(giderlerYanit.data);
        } catch (hata) {
            console.error('Veri hatası:', hata);
        } finally {
            setYukleniyor(false);
        }
    };

    useEffect(() => {
        verileriGetir();
    }, []);

    const filtrelenmisVerileriGetir = () => {
        const simdi = new Date();
        const baslangic = new Date();

        if (filtre === 'gunluk') baslangic.setHours(0, 0, 0, 0);
        if (filtre === 'haftalik') baslangic.setDate(simdi.getDate() - 7);
        if (filtre === 'aylik') baslangic.setMonth(simdi.getMonth() - 1);

        const tarihFiltresi = (tarihStr: string) => new Date(tarihStr) >= baslangic;

        return {
            siparisler: siparisler.filter(s => tarihFiltresi(s.olusturulmaTarihi)),
            odemeler: odemeler.filter(o => tarihFiltresi(o.olusturulmaTarihi)),
            giderler: giderler.filter(g => tarihFiltresi(g.olusturulmaTarihi)),
        };
    };

    const istatistikleriHesapla = () => {
        const { siparisler: fSiparisler, odemeler: fOdemeler, giderler: fGiderler } = filtrelenmisVerileriGetir();

        const istatistikler = {
            toplamSatis: 0,
            pesinSatis: 0,
            veresiyeSatis: 0,
            toplamTahsilat: 0,
            toplamGider: 0,
            netGelir: 0,
            urunSatislari: {} as Record<string, { miktar: number; gelir: number }>,
        };

        fSiparisler.forEach((siparis) => {
            const tutar = Number(siparis.toplamTutar);
            istatistikler.toplamSatis += tutar;
            if (siparis.tur === 'cash') istatistikler.pesinSatis += tutar;
            else istatistikler.veresiyeSatis += tutar;

            if (siparis.ogeler && Array.isArray(siparis.ogeler)) {
                siparis.ogeler.forEach((oge) => {
                    const urunAdi = oge.urun?.ad || 'Bilinmeyen Ürün';
                    if (!istatistikler.urunSatislari[urunAdi]) {
                        istatistikler.urunSatislari[urunAdi] = { miktar: 0, gelir: 0 };
                    }
                    istatistikler.urunSatislari[urunAdi].miktar += oge.miktar;
                    istatistikler.urunSatislari[urunAdi].gelir += Number(oge.toplamFiyat);
                });
            }
        });

        fOdemeler.forEach((odeme) => {
            istatistikler.toplamTahsilat += Number(odeme.tutar);
        });

        fGiderler.forEach((gider) => {
            istatistikler.toplamGider += Number(gider.tutar);
        });

        istatistikler.netGelir = (istatistikler.pesinSatis + istatistikler.toplamTahsilat) - istatistikler.toplamGider;

        return istatistikler;
    };

    const istatistikler = istatistikleriHesapla();

    if (yukleniyor) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Başlık */}
                <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Banknote className="text-purple-600" /> Nakit Akışı ve Raporlar
                        </h1>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        {(['gunluk', 'haftalik', 'aylik'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFiltre(f)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filtre === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {f === 'gunluk' ? 'Günlük' : f === 'haftalik' ? 'Haftalık' : 'Aylık'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="text-gray-500 text-sm mb-1">Toplam Satış (Ciro)</div>
                        <div className="text-2xl font-bold text-gray-800">₺{istatistikler.toplamSatis.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 mt-1">
                            Peşin: ₺{istatistikler.pesinSatis.toFixed(2)} | Veresiye: ₺{istatistikler.veresiyeSatis.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="text-gray-500 text-sm mb-1">Kasa Girişi (Peşin+Tahsilat)</div>
                        <div className="text-2xl font-bold text-green-600">
                            ₺{(istatistikler.pesinSatis + istatistikler.toplamTahsilat).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            Tahsilat: ₺{istatistikler.toplamTahsilat.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                        <div className="text-gray-500 text-sm mb-1">Toplam Giderler</div>
                        <div className="text-2xl font-bold text-red-600">₺{istatistikler.toplamGider.toFixed(2)}</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-600">
                        <div className="text-gray-500 text-sm mb-1">Net Gelir</div>
                        <div className="text-2xl font-bold text-purple-700">₺{istatistikler.netGelir.toFixed(2)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ürün Bazlı Satışlar */}
                    <div className="bg-white rounded-lg shadow-sm p-6 max-h-[500px] overflow-y-auto col-span-1">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Ürün Satışları
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(istatistikler.urunSatislari)
                                .sort(([, a], [, b]) => b.gelir - a.gelir)
                                .map(([ad, veri]) => (
                                    <div key={ad} className="flex justify-between items-center border-b pb-2">
                                        <span className="text-sm font-medium text-gray-700">{ad}</span>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-800">₺{veri.gelir.toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">{veri.miktar} adet</div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Tahsilatlar & Giderler Grid */}
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Tahsilatlar */}
                        <div className="bg-white rounded-lg shadow-sm p-6 max-h-[500px] overflow-y-auto">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard className="text-green-500" /> Son Tahsilatlar
                            </h2>
                            <div className="space-y-3">
                                {filtrelenmisVerileriGetir().odemeler.slice(0, 20).map((o) => (
                                    <div key={o.id} className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                                        <div>
                                            <div className="font-bold text-gray-700">{o.kullanici?.ad} {o.kullanici?.soyad}</div>
                                            <div className="text-xs text-gray-500">{new Date(o.olusturulmaTarihi).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                        <div className="font-bold text-green-600">+₺{Number(o.tutar).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Giderler */}
                        <div className="bg-white rounded-lg shadow-sm p-6 max-h-[500px] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <TrendingDown className="text-red-500" /> Giderler
                                </h2>
                                <button
                                    onClick={() => setGiderModalAcik(true)}
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1.5 rounded-md flex items-center gap-1 transition"
                                >
                                    <Plus size={14} /> Gider Ekle
                                </button>
                            </div>

                            {giderler.length === 0 ? (
                                <div className="text-gray-400 text-center py-4">Henüz gider yok.</div>
                            ) : (
                                <div className="space-y-3">
                                    {filtrelenmisVerileriGetir().giderler.map((g) => (
                                        <div key={g.id} className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
                                            <div>
                                                <div className="font-bold text-gray-700">{g.aciklama}</div>
                                                <div className="text-xs text-gray-500">{new Date(g.olusturulmaTarihi).toLocaleDateString('tr-TR')}</div>
                                            </div>
                                            <div className="font-bold text-red-600">-₺{Number(g.tutar).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <GiderEkleModal
                acik={giderModalAcik}
                kapat={() => setGiderModalAcik(false)}
                basariliOldugunda={verileriGetir}
            />
        </div>
    );
};

export default NakitAkisi;
