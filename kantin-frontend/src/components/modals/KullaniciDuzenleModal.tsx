import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';
import { Kullanici } from '../../types';

interface KullaniciDuzenleModalOzellikleri {
    acik: boolean;
    kapat: () => void;
    basariliOldugunda: () => void;
    kullanici: Kullanici;
}

const KullaniciDuzenleModal: React.FC<KullaniciDuzenleModalOzellikleri> = ({ acik, kapat, basariliOldugunda, kullanici }) => {
    const [ad, setAd] = useState('');
    const [soyad, setSoyad] = useState('');
    const [telefon, setTelefon] = useState('');
    const [sifre, setSifre] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    useEffect(() => {
        if (kullanici && acik) {
            setAd(kullanici.ad);
            setSoyad(kullanici.soyad);
            setTelefon(kullanici.telefon);
            setSifre('');
        }
    }, [kullanici, acik]);

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!kullanici) return;
        setYukleniyor(true);

        try {
            const veri: any = { ad, soyad, telefon };
            if (sifre) {
                veri.sifre = sifre;
            }

            await api.patch(`/kullanicilar/${kullanici.id}`, veri);
            basariliOldugunda();
            kapat();
        } catch (hata) {
            console.error('Güncelleme hatası:', hata);
            alert('Kullanıcı güncellenirken bir hata oluştu.');
        } finally {
            setYukleniyor(false);
        }
    };

    if (!acik || !kullanici) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Kullanıcı Düzenle</h2>
                    <button onClick={kapat} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={gonder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ad</label>
                        <input
                            type="text"
                            required
                            className="mt-1 w-full p-2 border rounded-md"
                            value={ad}
                            onChange={(e) => setAd(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Soyad</label>
                        <input
                            type="text"
                            required
                            className="mt-1 w-full p-2 border rounded-md"
                            value={soyad}
                            onChange={(e) => setSoyad(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefon</label>
                        <input
                            type="text"
                            required
                            className="mt-1 w-full p-2 border rounded-md"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Yeni Şifre (İsteğe Bağlı)</label>
                        <input
                            type="password"
                            placeholder="Değiştirmek için yeni şifre girin"
                            className="mt-1 w-full p-2 border rounded-md bg-yellow-50"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Şifreyi değiştirmek istemiyorsanız boş bırakın.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={yukleniyor}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                    >
                        {yukleniyor ? 'Güncelleniyor...' : <><Save size={20} /> Kaydet</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default KullaniciDuzenleModal;
