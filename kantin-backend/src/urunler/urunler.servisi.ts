
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Urun } from '../entities/urun.entity';
import { UrunOlusturmaDto, UrunGuncellemeDto } from '../dtos/urun.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UrunServisi {
    constructor(
        @InjectRepository(Urun)
        private readonly urunDeposu: Repository<Urun>,
    ) { }

    async olustur(urunOlusturmaDto: UrunOlusturmaDto): Promise<Urun> {
        const urun = this.urunDeposu.create(urunOlusturmaDto);
        const kaydedilenUrun = await this.urunDeposu.save(urun);
        return this.bul((kaydedilenUrun as any)._id?.toString() || (kaydedilenUrun as any).id);
    }

    async tumunuGetir(): Promise<Urun[]> {
        const urunler = await this.urunDeposu.find();
        return urunler.map(u => {
            if (u._id) u.id = u._id;
            return u;
        });
    }

    async bul(id: string): Promise<Urun> {
        if (!ObjectId.isValid(id)) {
            throw new NotFoundException(`Geçersiz Ürün ID: ${id}`);
        }

        const urun = await this.urunDeposu.findOne({
            where: { _id: new ObjectId(id) } as any,
        });
        if (!urun) {
            throw new NotFoundException('Ürün bulunamadı');
        }
        if (urun._id) urun.id = urun._id;
        return urun;
    }

    async kategorisineGoreBul(kategoriId: string): Promise<Urun[]> {
        return this.urunDeposu.find({
            where: { kategoriId },
        });
    }

    async guncelle(id: string, urunGuncellemeDto: UrunGuncellemeDto): Promise<Urun> {
        if (!ObjectId.isValid(id)) {
            throw new NotFoundException(`Geçersiz Ürün ID: ${id}`);
        }
        await this.urunDeposu.update(new ObjectId(id), urunGuncellemeDto);
        return this.bul(id);
    }

    async sil(id: string): Promise<void> {
        if (!ObjectId.isValid(id)) {
            throw new NotFoundException(`Geçersiz Ürün ID: ${id}`);
        }
        const sonuc = await this.urunDeposu.delete(new ObjectId(id));
        if (sonuc.affected === 0) {
            throw new NotFoundException('Ürün bulunamadı');
        }
    }
}

