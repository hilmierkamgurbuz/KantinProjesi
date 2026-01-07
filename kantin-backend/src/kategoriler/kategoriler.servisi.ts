import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kategori } from '../entities/kategori.entity';
import { KategoriOlusturmaDto, KategoriGuncellemeDto } from '../dtos/kategori.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class KategoriServisi {
    constructor(
        @InjectRepository(Kategori)
        private readonly kategoriDeposu: Repository<Kategori>,
    ) { }

    olustur(kategoriOlusturmaDto: KategoriOlusturmaDto): Promise<Kategori> {
        const kategori = this.kategoriDeposu.create(kategoriOlusturmaDto);
        return this.kategoriDeposu.save(kategori);
    }

    async tumunuGetir(): Promise<Kategori[]> {
        const kategoriler = await this.kategoriDeposu.find();
        return kategoriler.map(k => {
            if (k._id) k.id = k._id;
            return k;
        });
    }

    async bul(id: string): Promise<Kategori> {
        const kategori = await this.kategoriDeposu.findOne({ where: { _id: new ObjectId(id) } as any });
        if (!kategori) {
            throw new NotFoundException('Kategori bulunamadı');
        }
        if (kategori._id) kategori.id = kategori._id;
        return kategori;
    }

    async guncelle(id: string, kategoriGuncellemeDto: KategoriGuncellemeDto): Promise<Kategori> {
        await this.kategoriDeposu.update(new ObjectId(id), kategoriGuncellemeDto);
        return this.bul(id);
    }

    async sil(id: string): Promise<void> {
        const sonuc = await this.kategoriDeposu.delete(new ObjectId(id));
        if (sonuc.affected === 0) {
            throw new NotFoundException('Kategori bulunamadı');
        }
    }
}
