import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Kullanici, KullaniciRolu } from '../entities/kullanici.entity';
import { KullaniciOlusturmaDto, KullaniciGuncellemeDto } from '../dtos/kullanici.dto';
import * as bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

@Injectable()
export class KullaniciServisi implements OnModuleInit {
    constructor(
        @InjectRepository(Kullanici)
        private readonly kullaniciDeposu: Repository<Kullanici>,
    ) { }

    async onModuleInit() {
        await this.pesinMusteriKontrolu();
        await this.adminHesabiKontrolu();
    }

    async pesinMusteriKontrolu() {

        let pesinMusteri = await this.kullaniciDeposu.findOne({ where: { rol: KullaniciRolu.PESIN_MUSTERI } });

        if (pesinMusteri) {

            if (pesinMusteri.soyad !== 'Satış') {
                pesinMusteri.ad = 'Peşin';
                pesinMusteri.soyad = 'Satış';
                await this.kullaniciDeposu.save(pesinMusteri);

            }
        } else {

            const sifrelenmisSifre = await bcrypt.hash('123456', 10);
            const kullanici = this.kullaniciDeposu.create({
                ad: 'Peşin',
                soyad: 'Satış',
                telefon: '0000000000',
                rol: KullaniciRolu.PESIN_MUSTERI,
                sifre: sifrelenmisSifre,
                bakiye: 0,
                aktifMi: true
            });
            await this.kullaniciDeposu.save(kullanici);

        }
    }

    async adminHesabiKontrolu() {
        const telefon = '05519882266';
        const adminMevcut = await this.telefonIleBul(telefon);

        if (!adminMevcut) {

            const sifrelenmisSifre = await bcrypt.hash('123456', 10);
            const admin = this.kullaniciDeposu.create({
                ad: 'Yönetici',
                soyad: 'Admin',
                telefon: telefon,
                rol: KullaniciRolu.YONETICI,
                sifre: sifrelenmisSifre,
                bakiye: 0,
                aktifMi: true
            });
            await this.kullaniciDeposu.save(admin);

        } else {

            if (adminMevcut.rol !== KullaniciRolu.YONETICI) {
                adminMevcut.rol = KullaniciRolu.YONETICI;
                await this.kullaniciDeposu.save(adminMevcut);

            }
        }
    }

    olustur(kullaniciOlusturmaDto: any): Promise<Kullanici> {
        const kullanici = this.kullaniciDeposu.create(kullaniciOlusturmaDto);
        return this.kullaniciDeposu.save(kullanici) as any;
    }

    async tumunuGetir(): Promise<Kullanici[]> {
        const kullanicilar = await this.kullaniciDeposu.find({
            where: { rol: Not(KullaniciRolu.YONETICI) },
            order: { olusturulmaTarihi: 'DESC' },
        });

        return kullanicilar.map(k => {
            // _id varsa string'e çevirip id'ye ata
            if (k._id) {
                k.id = k._id.toString();
            }
            return k;
        });
    }

    async bul(id: string): Promise<Kullanici> {
        try {
            // MongoDB'de _id ile arama yapmak için explicit olarak belirtiyoruz
            // TypeORM Mongo driver bazen id -> _id mapping'ini karıştırabiliyor
            const kullanici = await this.kullaniciDeposu.findOne({
                where: { _id: new ObjectId(id) } as any,
            });
            if (!kullanici) {
                throw new NotFoundException('Kullanıcı bulunamadı');
            }
            return kullanici;
        } catch (e) {
            console.error('KullaniciServisi.bul hatasi:', e);
            throw e;
        }
    }

    async telefonIleBul(telefon: string): Promise<Kullanici | null> {
        return this.kullaniciDeposu.findOne({
            where: { telefon },
            select: ['id', 'ad', 'soyad', 'telefon', 'rol', 'bakiye', 'aktifMi', 'sifre', 'olusturulmaTarihi'] as any
        });
    }

    async guncelle(id: string, kullaniciGuncellemeDto: KullaniciGuncellemeDto): Promise<Kullanici> {


        const veri: any = { ...kullaniciGuncellemeDto };
        if (veri.sifre) {
            veri.sifre = await bcrypt.hash(veri.sifre, 10);
        }

        await this.kullaniciDeposu.update(new ObjectId(id), veri);
        return this.bul(id);
    }

    async sil(id: string): Promise<void> {
        const sonuc = await this.kullaniciDeposu.delete(new ObjectId(id));
        if (sonuc.affected === 0) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }
    }

    async kullaniciBakiyesiniGetir(id: string): Promise<{ bakiye: number }> {
        const kullanici = await this.bul(id);
        return { bakiye: Number(kullanici.bakiye) };
    }

    async bakiyeGuncelle(id: string, tutar: number): Promise<Kullanici> {
        const kullanici = await this.bul(id);
        kullanici.bakiye = Number(kullanici.bakiye) + tutar;
        return this.kullaniciDeposu.save(kullanici) as any;
    }
}
