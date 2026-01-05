import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseGuards,
    ValidationPipe
} from '@nestjs/common';
import { SiparisServisi } from './siparisler.servisi';
import { SiparisOlusturmaDto } from '../dtos/siparis.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('siparisler')
@UseGuards(JwtYetkilendirmeKorumasi)
export class SiparisKontrolcusu {
    constructor(private readonly siparisServisi: SiparisServisi) { }

    @Post()
    olustur(@Body(ValidationPipe) siparisOlusturmaDto: SiparisOlusturmaDto) {
        return this.siparisServisi.olustur(siparisOlusturmaDto);
    }

    @Get()
    tumunuGetir(@Query('userId') kullaniciId?: string) {
        if (kullaniciId) {
            return this.siparisServisi.kullaniciyaGoreBul(kullaniciId);
        }
        return this.siparisServisi.tumunuGetir();
    }

    @Get('gunluk')
    gunlukSatislariGetir(@Query('date') tarih?: string) {
        return this.siparisServisi.gunlukSatislariGetir(tarih ? new Date(tarih) : new Date());
    }

    @Get(':id')
    bul(@Param('id') id: string) {
        return this.siparisServisi.bul(id);
    }

    @Delete(':id')
    sil(@Param('id') id: string) {
        return this.siparisServisi.sil(id);
    }
}
