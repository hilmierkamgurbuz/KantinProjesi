import React, { useState } from 'react';
import { X, Save, TrendingDown } from 'lucide-react';
import api from '../../services/api';

interface GiderEkleModalOzellikleri {
    acik: boolean;
    kapat: () => void;
    basariliOldugunda: () => void;
}

const GiderEkleModal: React.FC<GiderEkleModalOzellikleri> = ({ acik, kapat, basariliOldugunda }) => {
    const [aciklama, setAciklama] = useState('');
    const [tutar, setTutar] = useState('');
    const [yukleniyor, setYukleniyor] = useState(false);

    if (!acik) return null;

    const gonder = async (e: React.FormEvent) => {
        e.preventDefault();
        setYukleniyor(true);

        try {
            await api.post('/giderler', {
                aciklama,
                tutar: parseFloat(tutar),
            });
            setAciklama('');
            setTutar('');
            basariliOldugunda();
            kapat();
        } catch (hata) {
            console.error('Gider ekleme hatası:', hata);
            alert('Gider eklenirken bir hata oluştu.');
        } finally {
            setYukleniyor(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingDown className="text-red-500" /> Gider Ekle
                    </h2>
                    <button onClick={kapat} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={gonder} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gider Açıklaması</label>
                        <input
                            type="text"
                            required
                            placeholder="Örn: Market alışverişi, Temizlik..."
                            className="mt-1 w-full p-2 border rounded-md"
                            value={aciklama}
                            onChange={(e) => setAciklama(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tutar (₺)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 w-full p-2 border rounded-md"
                            value={tutar}
                            onChange={(e) => setTutar(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={yukleniyor}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition flex items-center justify-center gap-2"
                    >
                        {yukleniyor ? 'Ekleniyor...' : <><Save size={20} /> Kaydet</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GiderEkleModal;
