import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Kullanici, GirisYapmaDto, KayitOlusturmaDto } from '../types';
import { yetkilendirmeServisi } from '../services/yetkilendirmeServisi';

interface YetkilendirmeBaglamiTuru {
    kullanici: Kullanici | null;
    yukleniyor: boolean;
    girisYap: (girisYapmaDto: GirisYapmaDto) => Promise<void>;
    kayitOl: (kayitOlusturmaDto: KayitOlusturmaDto) => Promise<void>;
    cikisYap: () => void;
    yoneticiMi: boolean;
}

const YetkilendirmeBaglami = createContext<YetkilendirmeBaglamiTuru | undefined>(undefined);

export const YetkilendirmeSaglayici: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [kullanici, setKullanici] = useState<Kullanici | null>(null);
    const [yukleniyor, setYukleniyor] = useState(true);

    useEffect(() => {
        const mevcutKullanici = yetkilendirmeServisi.mevcutKullaniciyiGetir();
        setKullanici(mevcutKullanici);
        setYukleniyor(false);
    }, []);

    const girisYap = async (girisYapmaDto: GirisYapmaDto) => {
        const yanit = await yetkilendirmeServisi.girisYap(girisYapmaDto);
        setKullanici(yanit.kullanici);
    };

    const kayitOl = async (kayitOlusturmaDto: KayitOlusturmaDto) => {
        const yanit = await yetkilendirmeServisi.kayitOl(kayitOlusturmaDto);
        setKullanici(yanit.kullanici);
    };

    const cikisYap = () => {
        yetkilendirmeServisi.cikisYap();
        setKullanici(null);
    };

    const yoneticiMi = kullanici?.rol === 'admin';

    return (
        <YetkilendirmeBaglami.Provider value={{ kullanici, yukleniyor, girisYap, kayitOl, cikisYap, yoneticiMi }}>
            {children}
        </YetkilendirmeBaglami.Provider>
    );
};

export const useYetkilendirme = () => {
    const baglam = useContext(YetkilendirmeBaglami);
    if (baglam === undefined) {
        throw new Error('useYetkilendirme, YetkilendirmeSaglayici içinde kullanılmalıdır');
    }
    return baglam;
};
