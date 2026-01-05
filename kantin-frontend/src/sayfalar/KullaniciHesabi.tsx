import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYetkilendirme } from '../context/YetkilendirmeContext';
import api from '../services/api';
import type { Kullanici, Siparis, Odeme } from '../types';
import { KullaniciRolu } from '../types';
import { ArrowLeft, CreditCard, ShoppingBag, Trash2, Edit, PlusCircle, LogOut, Filter } from 'lucide-react';
import KullaniciDuzenleModal from '../components/modals/KullaniciDuzenleModal';
import OdemeEkleModal from '../components/modals/OdemeEkleModal';

const KullaniciHesabi: React.FC = () => {
    const { kullaniciId } = useParams<{ kullaniciId: string }>();
    const navigate = useNavigate();
    const { cikisYap, yoneticiMi } = useYetkilendirme();

    const [kullanici, setKullanici] = useState<Kullanici | null>(null);
    const [siparisler, setSiparisler] = useState<Siparis[]>([]);
    const [odemeler, setOdemeler] = useState<Odeme[]>([]);
    const [yukleniyor, setYukleniyor] = useState(true);

    // Modallar
    const [duzenleModalAcik, setDuzenleModalAcik] = useState(false);
    const [odemeModalAcik, setOdemeModalAcik] = useState(false);

    // Filtre
    const [zamanFiltresi, setZamanFiltresi] = useState<'gunluk' | 'haftalik' | 'aylik' | 'tumu'>('gunluk');

    const verileriGetir = async () => {
        if (!kullaniciId) return;
        try {
            setYukleniyor(true);
            const [kullaniciYanit, siparislerYanit, odemelerYanit] = await Promise.all([
                api.get<Kullanici>(`/kullanicilar/${kullaniciId}`),
                // Backend'de userId=... bekliyor
                api.get<Siparis[]>(`/siparisler?userId=${kullaniciId}`),
                api.get<Odeme[]>(`/odemeler?userId=${kullaniciId}`),
            ]);
            setKullanici(kullaniciYanit.data);
            setSiparisler(siparislerYanit.data.sort((a, b) => new Date(b.olusturulmaTarihi).getTime() - new Date(a.olusturulmaTarihi).getTime()));
            setOdemeler(odemelerYanit.data.sort((a, b) => new Date(b.olusturulmaTarihi).getTime() - new Date(a.olusturulmaTarihi).getTime()));
        } catch (hata) {
            console.error('Kullanıcı detay hatası:', hata);
            alert('Kullanıcı bilgileri yüklenemedi.');
        } finally {
            setYukleniyor(false);
        }
    };

    useEffect(() => {
        verileriGetir();
    }, [kullaniciId]);

    const kullaniciSil = async () => {
        if (!kullanici || !window.confirm(`${kullanici.ad} ${kullanici.soyad} kullanıcısını silmek istediğinize emin misiniz?`)) return;

        try {
            await api.delete(`/kullanicilar/${kullanici.id}`);
            alert('Kullanıcı silindi.');
            navigate('/');
        } catch (hata) {
            console.error('Silme hatası:', hata);
            alert('Kullanıcı silinirken hata oluştu.');
        }
    };

    const filtrelenmisVerileriGetir = () => {
        if (!kullanici || kullanici.rol !== KullaniciRolu.PESIN_MUSTERI) return { siparisler, odemeler };

        const simdi = new Date();
        const baslangic = new Date();

        if (zamanFiltresi === 'gunluk') baslangic.setHours(0, 0, 0, 0);
        else if (zamanFiltresi === 'haftalik') baslangic.setDate(simdi.getDate() - 7);
        else if (zamanFiltresi === 'aylik') baslangic.setMonth(simdi.getMonth() - 1);
        else baslangic.setFullYear(2000);

        return {
            siparisler: siparisler.filter(s => new Date(s.olusturulmaTarihi) >= baslangic),
            odemeler: odemeler,
        };
    };

    const istatistikleriHesapla = () => {
        const { siparisler: fSiparisler } = filtrelenmisVerileriGetir();
        const toplamSatis = fSiparisler.reduce((toplam, s) => toplam + Number(s.toplamTutar), 0);
        const toplamUrun = fSiparisler.reduce((toplam, s) => toplam + (s.ogeler?.reduce((i, oge) => i + oge.miktar, 0) || 0), 0);
        return { toplamSatis, toplamUrun };
    };

    if (yukleniyor) return <div className="p-8 text-center">Yükleniyor...</div>;
    if (!kullanici) return <div className="p-8 text-center">Kullanıcı bulunamadı.</div>;

    const pesinMusteriMi = kullanici.rol === KullaniciRolu.PESIN_MUSTERI;
    const { toplamSatis, toplamUrun } = istatistikleriHesapla();
    const { siparisler: goruntulenenSiparisler } = filtrelenmisVerileriGetir();

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Başlık Seçenekleri */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Panele Dön</span>
                    </button>

                    {yoneticiMi ? (
                        <div className="flex gap-2 bg-white px-2 py-1 rounded-lg shadow-sm">
                            {!pesinMusteriMi && (
                                <button
                                    onClick={() => setDuzenleModalAcik(true)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded transition"
                                    title="Düzenle"
                                >
                                    <Edit size={20} />
                                </button>
                            )}
                            {pesinMusteriMi ? null : (
                                <button
                                    onClick={kullaniciSil}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                                    title="Kullanıcıyı Sil"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => { cikisYap(); navigate('/giris'); }}
                            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg border border-red-200 bg-white shadow-sm transition"
                        >
                            <LogOut size={20} /> Çıkış Yap
                        </button>
                    )}
                </div>

                {/* Kullanıcı Kartı */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className={`p-6 ${pesinMusteriMi ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'}`}>
                        <div className="flex justify-between items-start text-white">
                            <div>
                                <h1 className="text-3xl font-bold">{kullanici.ad} {kullanici.soyad}</h1>
                                <p className="opacity-90 flex items-center gap-2 mt-1">
                                    {pesinMusteriMi ? (
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm">Peşin Satış Hesabı</span>
                                    ) : (
                                        <>
                                            <span className="text-sm border border-white/30 px-2 rounded">{kullanici.telefon}</span>
                                            <span className="text-sm opacity-75"> • Kayıt: {new Date(kullanici.olusturulmaTarihi).toLocaleDateString()}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                            {!pesinMusteriMi && (
                                <div className="text-right">
                                    <div className="text-sm opacity-90 mb-1">Güncel Bakiye</div>
                                    <div className={`text-4xl font-bold ${kullanici.bakiye < 0 ? 'text-red-200' : 'text-white'}`}>
                                        ₺{kullanici.bakiye?.toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {!pesinMusteriMi ? (
                        // STANDART KULLANICI KONTROLLERİ
                        <div className="p-6 bg-white">
                            {yoneticiMi && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setOdemeModalAcik(true)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow transition transform active:scale-95"
                                    >
                                        <PlusCircle size={20} /> Ödeme Ekle
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // PEŞİN MÜŞTERİ KONTROLLERİ (Filtreler)
                        <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
                            <Filter size={18} className="text-gray-500" />
                            <div className="flex gap-2">
                                {(['gunluk', 'haftalik', 'aylik', 'tumu'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setZamanFiltresi(f)}
                                        className={`px-3 py-1 text-sm rounded-md border transition ${zamanFiltresi === f
                                            ? 'bg-white border-green-500 text-green-700 shadow-sm font-medium'
                                            : 'bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200'
                                            }`}
                                    >
                                        {f === 'gunluk' ? 'Günlük' : f === 'haftalik' ? 'Haftalık' : f === 'aylik' ? 'Aylık' : 'Tümü'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pesinMusteriMi ? (
                        <>
                            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-emerald-500">
                                <div className="text-gray-500 mb-1 font-medium">{zamanFiltresi === 'gunluk' ? 'Bugünkü' : zamanFiltresi === 'haftalik' ? 'Bu Haftaki' : 'Bu Ayki'} Satışlar</div>
                                <div className="text-3xl font-bold text-emerald-700">₺{toplamSatis.toFixed(2)}</div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-blue-500">
                                <div className="text-gray-500 mb-1 font-medium">Satılan Ürün Adedi</div>
                                <div className="text-3xl font-bold text-gray-800">{toplamUrun}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-red-500">
                                <div className="text-gray-500 mb-1 font-medium">Toplam Sipariş Tutarı</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    ₺{siparisler.reduce((acc, s) => acc + Number(s.toplamTutar), 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-green-500">
                                <div className="text-gray-500 mb-1 font-medium">Toplam Tahsilat</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    ₺{odemeler.reduce((acc, o) => acc + Number(o.tutar), 0).toFixed(2)}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sipariş Geçmişi */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="font-bold flex items-center gap-2">
                                <ShoppingBag className="text-blue-500" />
                                {pesinMusteriMi ? 'Satış Geçmişi' : 'Sipariş Geçmişi'}
                            </h2>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Son {goruntulenenSiparisler.length} işlem</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {goruntulenenSiparisler.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">Bu dönemde işlem yok.</div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="p-3 text-left">Tarih</th>
                                            <th className="p-3 text-left">İçerik</th>
                                            <th className="p-3 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {goruntulenenSiparisler.map((siparis) => (
                                            <tr key={siparis.id} className="hover:bg-gray-50/50">
                                                <td className="p-3 text-gray-500 whitespace-nowrap">
                                                    {new Date(siparis.olusturulmaTarihi).toLocaleDateString('tr-TR')} <br />
                                                    <span className="text-xs">{new Date(siparis.olusturulmaTarihi).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="max-h-16 overflow-y-auto custom-scrollbar">
                                                        {siparis.ogeler?.map((oge, idx) => (
                                                            <div key={idx} className="text-gray-700">
                                                                {oge.miktar}x {oge.urun?.ad || 'Ürün'}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-bold text-gray-800">
                                                    ₺{Number(siparis.toplamTutar).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Tahsilat Geçmişi */}
                    {!pesinMusteriMi && (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="font-bold flex items-center gap-2">
                                    <CreditCard className="text-green-500" /> Tahsilat Geçmişi
                                </h2>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                {odemeler.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">Henüz tahsilat yok.</div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="p-3 text-left">Tarih</th>
                                                <th className="p-3 text-left">Not</th>
                                                <th className="p-3 text-right">Tutar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {odemeler.map((odeme) => (
                                                <tr key={odeme.id} className="hover:bg-gray-50/50">
                                                    <td className="p-3 text-gray-500 whitespace-nowrap">
                                                        {new Date(odeme.olusturulmaTarihi).toLocaleDateString('tr-TR')}
                                                    </td>
                                                    <td className="p-3 text-gray-600">{odeme.notlar || '-'}</td>
                                                    <td className="p-3 text-right font-bold text-green-600">
                                                        +₺{Number(odeme.tutar).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <KullaniciDuzenleModal
                acik={duzenleModalAcik}
                kapat={() => setDuzenleModalAcik(false)}
                basariliOldugunda={verileriGetir}
                kullanici={kullanici}
            />
            <OdemeEkleModal
                acik={odemeModalAcik}
                kapat={() => setOdemeModalAcik(false)}
                basariliOldugunda={verileriGetir}
                kullaniciId={kullanici.id}
            />
        </div>
    );
};

export default KullaniciHesabi;
