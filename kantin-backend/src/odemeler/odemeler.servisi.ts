import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Odeme } from '../entities/odeme.entity';
import { OdemeOlusturmaDto } from '../dtos/odeme.dto';
import { ObjectId } from 'mongodb';
import { KullaniciServisi } from '../kullanicilar/kullanicilar.servisi';

@Injectable()
export class OdemeServisi {
    constructor(
        @InjectRepository(Odeme)
        private readonly odemeDeposu: Repository<Odeme>,
        private readonly kullaniciServisi: KullaniciServisi,
    ) { }

    async olustur(odemeOlusturmaDto: OdemeOlusturmaDto): Promise<Odeme> {
        const odeme = this.odemeDeposu.create({
            ...odemeOlusturmaDto,
            kullaniciId: odemeOlusturmaDto.kullaniciId,
        } as any);

        const kaydedilenOdeme = await this.odemeDeposu.save(odeme);

        // Bakiyeyi güncelle
        if (Number(odemeOlusturmaDto.tutar) > 0) {
            await this.kullaniciServisi.bakiyeGuncelle(odemeOlusturmaDto.kullaniciId, -Number(odemeOlusturmaDto.tutar));
        }

        return kaydedilenOdeme as unknown as Odeme;
    }

    tumunuGetir(): Promise<Odeme[]> {
        return this.odemeDeposu.find({
            order: { olusturulmaTarihi: 'DESC' },
        });
    }

    kullaniciyaGoreBul(kullaniciId: string): Promise<Odeme[]> {
        return this.odemeDeposu.find({
            where: { kullaniciId },
            order: { olusturulmaTarihi: 'DESC' },
        });
    }

    async bul(id: string): Promise<Odeme> {
        const odeme = await this.odemeDeposu.findOne({
            where: { id: new ObjectId(id) as any },
        });
        if (!odeme) {
            throw new NotFoundException('Ödeme bulunamadı');
        }
        return odeme;
    }

    async sil(id: string): Promise<void> {
        const odeme = await this.bul(id);

        // Silinince bakiyeyi iade et (borç artar)
        await this.kullaniciServisi.bakiyeGuncelle(odeme.kullaniciId, Number(odeme.tutar));

        await this.odemeDeposu.delete(new ObjectId(id));
    }

    async tarihAraliginaGoreBul(baslangicTarihi: Date, bitisTarihi: Date): Promise<Odeme[]> {
        const odemeler = await this.tumunuGetir();
        return odemeler.filter(o =>
            o.olusturulmaTarihi >= baslangicTarihi &&
            o.olusturulmaTarihi <= bitisTarihi
        );
    }

    async toplamOdemeleriGetir(kullaniciId?: string) {
        let odemeler: Odeme[];
        if (kullaniciId) {
            odemeler = await this.kullaniciyaGoreBul(kullaniciId);
        } else {
            odemeler = await this.tumunuGetir();
        }

        const toplam = odemeler.reduce((acc, curr) => acc + Number(curr.tutar), 0);
        return { toplam };
    }
}
