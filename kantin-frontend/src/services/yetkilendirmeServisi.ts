import api from './api';
import { GirisYapmaDto, KayitOlusturmaDto, GirisYaniti, Kullanici } from '../types';

export const yetkilendirmeServisi = {
    async girisYap(girisYapmaDto: GirisYapmaDto): Promise<GirisYaniti> {
        // Backend { user, token } dönüyor, biz { kullanici, token } olarak mapeleyeceğiz
        const yanit = await api.post<any>('/yetkilendirme/giris', girisYapmaDto);
        if (yanit.data.token) {
            console.log('Jeton alındı ve kaydedildi:', yanit.data.token);
            localStorage.setItem('token', yanit.data.token);
            // Backend 'user' objesi dönüyor, bunu 'kullanici' olarak saklayalım veya olduğu gibi saklayalım.
            // Frontend genelinde 'user' key'i localStorage'da kullanılıyordu. 'kullanici' yapalım.
            localStorage.setItem('kullanici', JSON.stringify(yanit.data.user));
        } else {
            console.error('Giriş yanıtında jeton yok!', yanit.data);
        }

        return {
            kullanici: yanit.data.user,
            token: yanit.data.token
        };
    },

    async kayitOl(kayitOlusturmaDto: KayitOlusturmaDto): Promise<GirisYaniti> {
        const yanit = await api.post<any>('/yetkilendirme/kayit', kayitOlusturmaDto);
        if (yanit.data.token) {
            localStorage.setItem('token', yanit.data.token);
            localStorage.setItem('kullanici', JSON.stringify(yanit.data.user));
        }
        return {
            kullanici: yanit.data.user,
            token: yanit.data.token
        };
    },

    cikisYap() {
        localStorage.removeItem('token');
        localStorage.removeItem('kullanici');
    },

    mevcutKullaniciyiGetir(): Kullanici | null {
        const kullaniciStr = localStorage.getItem('kullanici');
        return kullaniciStr ? JSON.parse(kullaniciStr) : null;
    },

    yetkiliMi(): boolean {
        return !!localStorage.getItem('token');
    },
};
