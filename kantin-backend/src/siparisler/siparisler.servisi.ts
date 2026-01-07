import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Siparis, SiparisTuru } from '../entities/siparis.entity';
import { SiparisOgesi } from '../entities/siparis-ogesi.entity';
import { SiparisOlusturmaDto } from '../dtos/siparis.dto';
import { KullaniciServisi } from '../kullanicilar/kullanicilar.servisi';
import { UrunServisi } from '../urunler/urunler.servisi';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SiparisServisi {
    constructor(
        @InjectRepository(Siparis)
        private readonly siparisDeposu: Repository<Siparis>,
        private readonly kullaniciServisi: KullaniciServisi,
        private readonly urunServisi: UrunServisi,
    ) { }

    async olustur(siparisOlusturmaDto: SiparisOlusturmaDto): Promise<Siparis> {
        // Kullanıcı kontrolü
        const kullanici = await this.kullaniciServisi.bul(siparisOlusturmaDto.kullaniciId);
        if (!kullanici) {
            throw new NotFoundException(`Kullanıcı bulunamadı (ID: ${siparisOlusturmaDto.kullaniciId})`);
        }

        // Bakiye Kontrolü (Veresiye için 10 TL limit - Borç Modeli)
        const toplamTutar = siparisOlusturmaDto.ogeler.reduce(
            (toplam, oge) => toplam + Number(oge.miktar) * Number(oge.birimFiyat),
            0,
        );



        // Ürün kontrolü ve Hazırlık
        const gelenOgeler = Array.isArray(siparisOlusturmaDto.ogeler) ? siparisOlusturmaDto.ogeler : [];
        const ogeler: SiparisOgesi[] = [];

        for (const oge of gelenOgeler) {
            try {
                // Ürünü bul ve kontrol et
                const urun = await this.urunServisi.bul(oge.urunId);
                if (!urun) throw new Error();

                const yeniOge = new SiparisOgesi();
                yeniOge.id = uuidv4();
                yeniOge.urunId = oge.urunId;
                yeniOge.miktar = Number(oge.miktar);
                yeniOge.birimFiyat = Number(oge.birimFiyat);
                yeniOge.toplamFiyat = yeniOge.miktar * yeniOge.birimFiyat;
                ogeler.push(yeniOge);

            } catch (e) {
                throw new NotFoundException(`Ürün bulunamadı (ID: ${oge.urunId})`);
            }
        }

        const siparis = this.siparisDeposu.create({
            kullaniciId: siparisOlusturmaDto.kullaniciId,
            tur: siparisOlusturmaDto.tur,
            toplamTutar,
            notlar: siparisOlusturmaDto.notlar,
            ogeler: ogeler
        });

        const kaydedilenSiparis = await this.siparisDeposu.save(siparis);

        if (siparisOlusturmaDto.tur === SiparisTuru.VERESIYE || !siparisOlusturmaDto.tur) {
            // Borcu ARTIR (Pozitif bakiye = Borç)
            await this.kullaniciServisi.bakiyeGuncelle(siparisOlusturmaDto.kullaniciId, toplamTutar);
        }

        return this.bul((kaydedilenSiparis as any)._id?.toString() || (kaydedilenSiparis as any).id);
    }

    async tumunuGetir(): Promise<Siparis[]> {
        const siparisler = await this.siparisDeposu.find({
            order: { olusturulmaTarihi: 'DESC' },
        });
        return this.siparisleriDoldur(siparisler);
    }

    async bul(id: string): Promise<Siparis> {
        if (!ObjectId.isValid(id)) {
            throw new NotFoundException(`Geçersiz Sipariş ID: ${id}`);
        }

        const siparis = await this.siparisDeposu.findOne({
            where: { _id: new ObjectId(id) } as any,
        });

        if (!siparis) {
            throw new NotFoundException('Sipariş bulunamadı');
        }

        const [doluSiparis] = await this.siparisleriDoldur([siparis]);
        return doluSiparis;
    }

    async kullaniciyaGoreBul(kullaniciId: string): Promise<Siparis[]> {
        const siparisler = await this.siparisDeposu.find({
            where: { kullaniciId },
            order: { olusturulmaTarihi: 'DESC' },
        });
        return this.siparisleriDoldur(siparisler);
    }

    async tarihAraliginaGoreBul(baslangicTarihi: Date, bitisTarihi: Date): Promise<Siparis[]> {
        const siparisler = await this.siparisDeposu.find({
            order: { olusturulmaTarihi: 'DESC' }
        });

        const filtrelenmis = siparisler.filter(s => {
            const tarih = new Date(s.olusturulmaTarihi);
            return tarih >= baslangicTarihi && tarih <= bitisTarihi;
        });

        return this.siparisleriDoldur(filtrelenmis);
    }

    async sil(id: string): Promise<void> {
        const siparis = await this.bul(id);

        if (siparis.tur === SiparisTuru.VERESIYE) {
            await this.kullaniciServisi.bakiyeGuncelle(siparis.kullaniciId, -Number(siparis.toplamTutar));
        }

        await this.siparisDeposu.delete(new ObjectId(id));
    }

    async gunlukSatislariGetir(tarih: Date) {
        const gunBaslangici = new Date(tarih);
        gunBaslangici.setHours(0, 0, 0, 0);

        const gunBitisi = new Date(tarih);
        gunBitisi.setHours(23, 59, 59, 999);

        const siparisler = await this.tarihAraliginaGoreBul(gunBaslangici, gunBitisi);

        const toplamSatis = siparisler.reduce((toplam, siparis) => toplam + Number(siparis.toplamTutar), 0);
        const pesinSatislar = siparisler
            .filter(siparis => siparis.tur === SiparisTuru.PESIN)
            .reduce((toplam, siparis) => toplam + Number(siparis.toplamTutar), 0);
        const veresiyeSatislar = siparisler
            .filter(siparis => siparis.tur === SiparisTuru.VERESIYE)
            .reduce((toplam, siparis) => toplam + Number(siparis.toplamTutar), 0);

        return {
            tarih,
            toplamSiparis: siparisler.length,
            toplamSatis,
            pesinSatislar,
            veresiyeSatislar,
            siparisler,
        };
    }

    // Helper: Manuel population
    private async siparisleriDoldur(siparisler: Siparis[]): Promise<Siparis[]> {
        if (!siparisler.length) return [];

        // Kullanıcıları yükle
        const kullaniciIds = [...new Set(siparisler.map(s => s.kullaniciId).filter(id => id))];
        const kullanicilar = await Promise.all(
            kullaniciIds.map(id => this.kullaniciServisi.bul(id).catch(() => null))
        );
        const kullaniciMap = new Map(kullanicilar.filter(k => k).map(k => [k!.id.toString(), k]));

        // Ürünleri yükle
        const urunIds = [...new Set(siparisler.flatMap(s => (Array.isArray(s.ogeler) ? s.ogeler.map(o => o.urunId) : [])))];
        const urunler = await Promise.all(
            urunIds.map(id => this.urunServisi.bul(id).catch(() => null))
        );
        const urunMap = new Map(urunler.filter(u => u).map(u => [u!.id.toString(), u]));

        // Nesnelere ata
        return siparisler.map(siparis => {
            // ID Mapping
            if ((siparis as any)._id) siparis.id = (siparis as any)._id;

            // Kullanıcı eşleştirme
            if (siparis.kullaniciId) {
                const kullaniciObj = kullaniciMap.get(siparis.kullaniciId.toString());
                if (kullaniciObj) siparis.kullanici = kullaniciObj;
            }

            // Öğeleri eşleştirme
            if (Array.isArray(siparis.ogeler)) {
                siparis.ogeler = siparis.ogeler.map(oge => {
                    if (oge && oge.urunId) {
                        const urunObj = urunMap.get(oge.urunId.toString());
                        if (urunObj) oge.urun = urunObj;
                    }
                    return oge;
                });
            } else {
                siparis.ogeler = [];
            }
            return siparis;
        });
    }
}
