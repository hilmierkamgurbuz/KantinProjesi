import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gider } from '../entities/gider.entity';
import { GiderOlusturmaDto } from '../dtos/gider.dto';

@Injectable()
export class GiderServisi {
    constructor(
        @InjectRepository(Gider)
        private giderDeposu: Repository<Gider>,
    ) { }

    olustur(giderOlusturmaDto: GiderOlusturmaDto) {
        const gider = this.giderDeposu.create(giderOlusturmaDto);
        return this.giderDeposu.save(gider);
    }

    tumunuGetir() {
        return this.giderDeposu.find({
            order: { olusturulmaTarihi: 'DESC' },
        });
    }
}
