import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYetkilendirme } from '../context/YetkilendirmeContext';
import api from '../services/api';
import type { Kullanici, Kategori, Urun, SiparisOgesi } from '../types';
import { KullaniciRolu } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, UserPlus, FolderPlus, PackagePlus, LogOut, Banknote, Receipt } from 'lucide-react';
import KategoriEkleModal from '../components/modals/KategoriEkleModal';
import UrunEkleModal from '../components/modals/UrunEkleModal';
import KullaniciEkleModal from '../components/modals/KullaniciEkleModal';
import UrunKarti from '../components/UrunKarti';

interface SepetOgesi extends Omit<SiparisOgesi, 'id'> {
    geciciId: string;
    urunAdi: string;
}

const Panel: React.FC = () => {
    const { kullanici: aktifKullanici, cikisYap, yoneticiMi } = useYetkilendirme();
    const navigate = useNavigate();
    const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [urunler, setUrunler] = useState<Urun[]>([]);
    const [secilenKullanici, setSecilenKullanici] = useState<Kullanici | null>(null);

    // Arama Durumu
    const [aramaTerimi, setAramaTerimi] = useState('');

    // Modallar
    const [kategoriModalAcik, setKategoriModalAcik] = useState(false);
    const [urunModalAcik, setUrunModalAcik] = useState(false);
    const [kullaniciModalAcik, setKullaniciModalAcik] = useState(false);

    // Sepet
    const [sepet, setSepet] = useState<SepetOgesi[]>([]);
    const [siparisYukleniyor, setSiparisYukleniyor] = useState(false);

    const verileriGetir = async () => {
        try {
            const [kullanicilarYanit, kategorilerYanit, urunlerYanit] = await Promise.all([
                api.get<Kullanici[]>('/kullanicilar'),
                api.get<Kategori[]>('/kategoriler'),
                api.get<Urun[]>('/urunler'),
            ]);
            setKullanicilar(kullanicilarYanit.data.filter(u => u.rol !== KullaniciRolu.YONETICI));
            setKategoriler(kategorilerYanit.data);
            setUrunler(urunlerYanit.data);
        } catch (hata) {
            console.error('Veri yükleme hatası:', hata);
        }
    };

    useEffect(() => {
        verileriGetir();
    }, []);

    const sepeteEkle = (urun: Urun, fiyat: number) => {
        setSepet((onceki) => {
            const mevcut = onceki.find((oge) => oge.urunId === urun.id && oge.birimFiyat === fiyat);
            if (mevcut) {
                return onceki.map((oge) =>
                    oge.geciciId === mevcut.geciciId
                        ? { ...oge, miktar: oge.miktar + 1, toplamFiyat: (oge.miktar + 1) * oge.birimFiyat }
                        : oge
                );
            }
            return [
                ...onceki,
                {
                    geciciId: Math.random().toString(36).substr(2, 9),
                    urunId: urun.id,
                    urunAdi: urun.ad,
                    miktar: 1,
                    birimFiyat: fiyat,
                    toplamFiyat: fiyat,
                },
            ];
        });
    };

    const sepettenCikar = (geciciId: string) => {
        setSepet((onceki) => onceki.filter((oge) => oge.geciciId !== geciciId));
    };

    const miktarGuncelle = (geciciId: string, degisim: number) => {
        setSepet((onceki) =>
            onceki.map((oge) => {
                if (oge.geciciId === geciciId) {
                    const yeniMiktar = Math.max(1, oge.miktar + degisim);
                    return { ...oge, miktar: yeniMiktar, toplamFiyat: yeniMiktar * oge.birimFiyat };
                }
                return oge;
            })
        );
    };

    const toplamHesapla = () => {
        return sepet.reduce((toplam, oge) => toplam + oge.toplamFiyat, 0);
    };

    const siparisOlustur = async () => {
        if (sepet.length === 0) return;
        if (!secilenKullanici) {
            alert('Lütfen bir kullanıcı seçin!');
            return;
        }

        setSiparisYukleniyor(true);
        try {
            const siparisVerisi = {
                kullaniciId: secilenKullanici.id,
                tur: secilenKullanici.rol === KullaniciRolu.PESIN_MUSTERI ? 'cash' : 'credit',
                ogeler: sepet.map(({ urunId, miktar, birimFiyat }) => ({
                    urunId,
                    miktar,
                    birimFiyat,
                })),
            };

            await api.post('/siparisler', siparisVerisi);

            setSepet([]);
            verileriGetir();
            alert('Sipariş başarıyla oluşturuldu!');
        } catch (hata) {
            console.error('Sipariş hatası:', hata);
            alert('Sipariş oluşturulurken hata oluştu.');
        } finally {
            setSiparisYukleniyor(false);
        }
    };

    const filtrelenmisKullanicilar = kullanicilar
        .filter(u =>
            (u.ad + ' ' + u.soyad).toLowerCase().includes(aramaTerimi.toLowerCase()) ||
            u.telefon.includes(aramaTerimi)
        )
        .sort((a, b) => {
            if (a.rol === KullaniciRolu.PESIN_MUSTERI) return -1;
            if (b.rol === KullaniciRolu.PESIN_MUSTERI) return 1;
            return a.ad.localeCompare(b.ad);
        });

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Üst Menü */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Kantin Yönetim
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {yoneticiMi && (
                                <div className="flex gap-2 mr-4">
                                    <button
                                        onClick={() => setKategoriModalAcik(true)}
                                        className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
                                    >
                                        <FolderPlus size={16} /> Kategori Ekle
                                    </button>
                                    <button
                                        onClick={() => navigate('/nakit-akisi')}
                                        className="flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200"
                                    >
                                        <Banknote size={16} /> Nakit Akışı
                                    </button>
                                    <button
                                        onClick={() => setUrunModalAcik(true)}
                                        className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
                                    >
                                        <PackagePlus size={16} /> Ürün Ekle
                                    </button>
                                    <button
                                        onClick={() => setKullaniciModalAcik(true)}
                                        className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200"
                                    >
                                        <UserPlus size={16} /> Üye Ekle
                                    </button>
                                    {secilenKullanici && secilenKullanici.rol !== KullaniciRolu.PESIN_MUSTERI && (
                                        <button
                                            onClick={() => navigate(`/hesap/${secilenKullanici.id}`)}
                                            className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200"
                                        >
                                            <Receipt size={16} /> Hesap
                                        </button>
                                    )}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {aktifKullanici?.ad} {aktifKullanici?.soyad}
                            </span>
                            <button
                                onClick={cikisYap}
                                className="text-gray-500 hover:text-red-600 transition"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
                {/* Sol: Kullanıcılar */}
                <div className="col-span-3 bg-white rounded-lg shadow flex flex-col max-h-[calc(100vh-100px)]">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold">Kullanıcılar</h2>
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="mt-2 w-full px-3 py-1.5 border rounded-md text-sm"
                            value={aramaTerimi}
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filtrelenmisKullanicilar.map((u) => (
                            <button
                                key={u.id}
                                onClick={() => setSecilenKullanici(u)}
                                className={`w-full text-left p-3 rounded-lg transition border ${secilenKullanici?.id === u.id
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                    : (u.rol === KullaniciRolu.PESIN_MUSTERI ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200')
                                    }`}
                            >
                                <div className="font-semibold flex justify-between">
                                    {u.ad} {u.soyad}
                                    {u.rol === KullaniciRolu.PESIN_MUSTERI && <span className="text-xs bg-green-200 text-green-800 px-1 rounded">PEŞİN</span>}
                                </div>
                                <div className={`text-sm ${secilenKullanici?.id === u.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {u.rol !== KullaniciRolu.PESIN_MUSTERI && (
                                        <>Hesap: <span className={u.bakiye < 0 ? 'text-red-500 font-bold' : ''}>₺{Number(u.bakiye).toFixed(2)}</span></>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orta: Ürünler */}
                <div className="col-span-6 bg-white rounded-lg shadow flex flex-col max-h-[calc(100vh-100px)]">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold">Ürünler</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {kategoriler.map((kategori) => {
                            const kategoriUrunleri = urunler.filter(p => p.kategoriId === kategori.id);
                            if (kategoriUrunleri.length === 0) return null;

                            return (
                                <div key={kategori.id}>
                                    <h3 className="font-semibold text-gray-700 mb-3 sticky top-0 bg-white py-1 z-0">{kategori.ad}</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                        {kategoriUrunleri.map((urun) => (
                                            <UrunKarti
                                                key={urun.id}
                                                urun={urun}
                                                sepeteEkle={sepeteEkle}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sağ: Sepet */}
                <div className="col-span-3 bg-white rounded-lg shadow flex flex-col max-h-[calc(100vh-100px)]">
                    <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <ShoppingCart size={20} /> Sepet
                        </h2>
                        {secilenKullanici ? (
                            <div className="mt-2 flex flex-col gap-2 w-full">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded inline-block">
                                        Müşteri: {secilenKullanici.ad} {secilenKullanici.soyad}
                                    </div>
                                    {secilenKullanici.rol === KullaniciRolu.PESIN_MUSTERI && (
                                        <span className="text-xs text-gray-500 font-mono">(PEŞİN)</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate(`/hesap/${secilenKullanici.id}`)}
                                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1.5 rounded-md transition"
                                >
                                    <Receipt size={16} /> {secilenKullanici.rol === KullaniciRolu.PESIN_MUSTERI ? 'Satış Geçmişi' : 'Hesap Görüntüle'}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2 flex flex-col gap-2 w-full">
                                <div className="text-sm text-red-700 bg-red-100 px-2 py-1 rounded inline-block">
                                    Lütfen müşteri seçin
                                </div>
                                {kullanicilar.find(u => u.rol === KullaniciRolu.PESIN_MUSTERI) ? (
                                    <button
                                        onClick={() => setSecilenKullanici(kullanicilar.find(u => u.rol === KullaniciRolu.PESIN_MUSTERI) || null)}
                                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm py-1.5 rounded-md transition"
                                    >
                                        <Banknote size={16} /> Peşin Seç
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setKullaniciModalAcik(true)}
                                        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm py-1.5 rounded-md transition"
                                    >
                                        <UserPlus size={16} /> Peşin Oluştur
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {sepet.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">Sepet boş</div>
                        ) : (
                            sepet.map((oge) => (
                                <div key={oge.geciciId} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{oge.urunAdi}</div>
                                        <div className="text-xs text-gray-500">₺{oge.birimFiyat} x {oge.miktar}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => miktarGuncelle(oge.geciciId, -1)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="text-sm w-4 text-center">{oge.miktar}</span>
                                        <button
                                            onClick={() => miktarGuncelle(oge.geciciId, 1)}
                                            className="p-1 hover:bg-gray-200 rounded text-gray-600"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <button
                                            onClick={() => sepettenCikar(oge.geciciId)}
                                            className="ml-2 text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-700">Toplam:</span>
                            <span className="text-xl font-bold text-blue-600">₺{toplamHesapla().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={siparisOlustur}
                            disabled={sepet.length === 0 || !secilenKullanici || siparisYukleniyor}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {siparisYukleniyor ? 'İşleniyor...' : 'Siparişi Onayla'}
                        </button>
                    </div>
                </div>

            </div>

            <KategoriEkleModal
                acik={kategoriModalAcik}
                kapat={() => setKategoriModalAcik(false)}
                basariliOldugunda={verileriGetir}
            />
            <UrunEkleModal
                acik={urunModalAcik}
                kapat={() => setUrunModalAcik(false)}
                kategoriler={kategoriler}
                basariliOldugunda={verileriGetir}
            />
            <KullaniciEkleModal
                acik={kullaniciModalAcik}
                kapat={() => setKullaniciModalAcik(false)}
                basariliOldugunda={verileriGetir}
            />
        </div>
    );
};

export default Panel;
