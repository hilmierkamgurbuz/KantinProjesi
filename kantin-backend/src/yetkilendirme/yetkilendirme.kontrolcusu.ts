import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { YetkilendirmeServisi } from './yetkilendirme.servisi';
import { KayitOlusturmaDto, GirisYapmaDto } from '../dtos/yetkilendirme.dto';

@Controller('yetkilendirme')
export class YetkilendirmeKontrolcusu {
    constructor(private readonly yetkilendirmeServisi: YetkilendirmeServisi) { }

    @Post('kayit')
    async kayitOl(@Body(ValidationPipe) kayitOlusturmaDto: KayitOlusturmaDto) {
        return this.yetkilendirmeServisi.kayitOl(kayitOlusturmaDto);
    }

    @Post('giris')
    async girisYap(@Body(ValidationPipe) girisYapmaDto: GirisYapmaDto) {
        return this.yetkilendirmeServisi.girisYap(girisYapmaDto);
    }
}
