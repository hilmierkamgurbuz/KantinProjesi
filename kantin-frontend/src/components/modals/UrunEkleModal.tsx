import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import type { Kategori } from '../../types';

interface UrunEkleModalOzellikleri {
    acik: boolean;
    kapat: () => void;
    basariliOldugunda: () => void;
    kategoriler: Kategori[];
}

const UrunEkleModal: React.FC<UrunEkleModalOzellikleri> = ({ acik, kapat, basariliOldugunda, kategoriler }) => {
    const [ad, setAd] = useState('');
    const [kategoriId, setKategoriId] = useState('');
    const [fiyatSecenekleriStr, setFiyatSecenekleriStr] = useState<string>('');
    const [manuelFiyatVarMi, setManuelFiyatVarMi] = useState(false);
    const [varsayilanFiyat, setVarsayilanFiyat] = useState<string>('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState('');

    useEffect(() => {
        if (!acik) {
            setAd('');
            setKategoriId('');
            setFiyatSecenekleriStr('');
            setManuelFiyatVarMi(false);
            setVarsayilanFiyat('');
            setHata('');
        }
    }, [acik]);

    if (!acik) return null;

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        setHata('');

        try {
            // Fiyatları ayrıştır
            const fiyatlar = fiyatSecenekleriStr
                .split(',')
                .map(p => parseFloat(p.trim()))
                .filter(p => !isNaN(p) && p > 0);

            const veri = {
                ad,
                kategoriId,
                fiyatSecenekleri: fiyatlar,
                manuelFiyatVarMi,
                varsayilanFiyat: varsayilanFiyat ? parseFloat(varsayilanFiyat) : undefined,
                aktifMi: true
            };

            await api.post('/urunler', veri);
            basariliOldugunda();
            kapat();
        } catch (err: any) {
            setHata(err.response?.data?.message || 'Ürün eklenirken bir hata oluştu');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Yeni Ürün Ekle</h2>
                    <button onClick={kapat} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={gonder} className="p-6">
                    {hata && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {hata}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Kategori
                        </label>
                        <select
                            value={kategoriId}
                            onChange={(e) => setKategoriId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Seçiniz</option>
                            {kategoriler.map((kat) => (
                                <option key={kat.id} value={kat.id}>
                                    {kat.ad}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Ürün Adı
                        </label>
                        <input
                            type="text"
                            value={ad}
                            onChange={(e) => setAd(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Fiyat Seçenekleri (Virgülle ayırın örn: 10, 20, 30)
                        </label>
                        <input
                            type="text"
                            value={fiyatSecenekleriStr}
                            onChange={(e) => setFiyatSecenekleriStr(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10, 20, 25"
                        />
                        <p className="text-xs text-gray-500 mt-1">Eğer tek fiyat varsa sadece onu yazın.</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Varsayılan Fiyat (Opsiyonel)
                        </label>
                        <input
                            type="number"
                            value={varsayilanFiyat}
                            onChange={(e) => setVarsayilanFiyat(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.5"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={manuelFiyatVarMi}
                                onChange={(e) => setManuelFiyatVarMi(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            />
                            <span className="text-gray-700 font-medium">Manuel Fiyat Girişine İzin Ver</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                            İşaretlenirse, satış sırasında özel fiyat girilebilir.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={kapat}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={yukleniyor}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-blue-300"
                        >
                            {yukleniyor ? 'Ekleniyor...' : 'Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UrunEkleModal;
