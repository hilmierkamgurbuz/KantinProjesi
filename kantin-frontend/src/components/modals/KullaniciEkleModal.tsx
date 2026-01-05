import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import { KullaniciRolu } from '../../types';

interface KullaniciEkleModalOzellikleri {
    acik: boolean;
    kapat: () => void;
    basariliOldugunda: () => void;
}

const KullaniciEkleModal: React.FC<KullaniciEkleModalOzellikleri> = ({ acik, kapat, basariliOldugunda }) => {
    const [formVerisi, setFormVerisi] = useState({
        ad: '',
        soyad: '',
        telefon: '',
        sifre: '',
        rol: KullaniciRolu.KULLANICI
    });
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState('');

    if (!acik) return null;

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        setHata('');

        try {
            await api.post('/yetkilendirme/kayit', formVerisi);
            setFormVerisi({
                ad: '',
                soyad: '',
                telefon: '',
                sifre: '',
                rol: KullaniciRolu.KULLANICI
            });
            basariliOldugunda();
            kapat();
        } catch (err: any) {
            setHata(err.response?.data?.message || 'Kullanıcı eklenirken bir hata oluştu');
        } finally {
            setYukleniyor(false);
        }
    };

    const degisiklikYap = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormVerisi(onceki => ({ ...onceki, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Yeni Kullanıcı Ekle</h2>
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

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Ad</label>
                            <input
                                type="text"
                                name="ad"
                                value={formVerisi.ad}
                                onChange={degisiklikYap}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Soyad</label>
                            <input
                                type="text"
                                name="soyad"
                                value={formVerisi.soyad}
                                onChange={degisiklikYap}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Telefon</label>
                        <input
                            type="text"
                            name="telefon"
                            value={formVerisi.telefon}
                            onChange={degisiklikYap}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="05xxxxxxxxx"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Şifre</label>
                        <input
                            type="text"
                            name="sifre"
                            value={formVerisi.sifre}
                            onChange={degisiklikYap}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                        <select
                            name="rol"
                            value={formVerisi.rol}
                            onChange={degisiklikYap}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={KullaniciRolu.KULLANICI}>Kullanıcı (Veresiye)</option>
                            <option value={KullaniciRolu.PESIN_MUSTERI}>Peşin Müşteri</option>
                            <option value={KullaniciRolu.YONETICI}>Yönetici</option>
                        </select>
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

export default KullaniciEkleModal;
