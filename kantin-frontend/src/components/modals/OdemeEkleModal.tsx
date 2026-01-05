import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

interface OdemeEkleModalOzellikleri {
    acik: boolean;
    kapat: () => void;
    basariliOldugunda: () => void;
    kullaniciId: string;
}

const OdemeEkleModal: React.FC<OdemeEkleModalOzellikleri> = ({ acik, kapat, basariliOldugunda, kullaniciId }) => {
    const [tutar, setTutar] = useState('');
    const [notlar, setNotlar] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);
    const [hata, setHata] = useState('');

    if (!acik) return null;

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);
        setHata('');

        try {
            await api.post('/odemeler', {
                kullaniciId,
                tutar: parseFloat(tutar),
                notlar
            });
            setTutar('');
            setNotlar('');
            basariliOldugunda();
            kapat();
        } catch (err: any) {
            setHata(err.response?.data?.message || 'Ödeme eklenirken bir hata oluştu');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Ödeme Ekle</h2>
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
                            Tutar (₺)
                        </label>
                        <input
                            type="number"
                            value={tutar}
                            onChange={(e) => setTutar(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Not (İsteğe Bağlı)
                        </label>
                        <textarea
                            value={notlar}
                            onChange={(e) => setNotlar(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                        />
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
                            {yukleniyor ? 'Ekleniyor...' : 'Ödeme Ekle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OdemeEkleModal;
