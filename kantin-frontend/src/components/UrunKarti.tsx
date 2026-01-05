import React, { useState } from 'react';
import { Urun } from '../types';

interface UrunKartiOzellikleri {
    urun: Urun;
    sepeteEkle: (urun: Urun, fiyat: number) => void;
}

const UrunKarti: React.FC<UrunKartiOzellikleri> = ({ urun, sepeteEkle }) => {
    const [manuelFiyat, setManuelFiyat] = useState('');

    const manuelEkle = () => {
        const deger = parseFloat(manuelFiyat);
        if (deger > 0) {
            sepeteEkle(urun, deger);
            setManuelFiyat('');
        }
    };

    const tusaBasildi = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            manuelEkle();
        }
    };

    return (
        <div
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition flex flex-col justify-between"
        >
            <div className="text-center font-bold text-gray-800 mb-2 truncate" title={urun.ad}>
                {urun.ad}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {urun.fiyatSecenekleri.map((fiyat) => (
                    <button
                        key={fiyat}
                        onClick={() => sepeteEkle(urun, Number(fiyat))}
                        className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium py-1 px-3 rounded-full transition shadow-sm"
                    >
                        ₺{fiyat}
                    </button>
                ))}
                {urun.varsayilanFiyat && (
                    <button
                        onClick={() => sepeteEkle(urun, Number(urun.varsayilanFiyat!))}
                        className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-medium py-1 px-3 rounded-full transition shadow-sm"
                    >
                        ₺{urun.varsayilanFiyat}
                    </button>
                )}
            </div>
            {urun.manuelFiyatVarMi && (
                <div className="mt-2 flex items-center gap-1 border-t pt-2">
                    <input
                        type="number"
                        placeholder="Manuel Fiyat"
                        className="w-full text-xs px-2 py-1 border rounded"
                        value={manuelFiyat}
                        onChange={(e) => setManuelFiyat(e.target.value)}
                        onKeyDown={tusaBasildi}
                    />
                    <button
                        onClick={manuelEkle}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                        Ekle
                    </button>
                </div>
            )}
        </div>
    );
};

export default UrunKarti;
