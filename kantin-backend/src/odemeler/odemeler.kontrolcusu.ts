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
import { OdemeServisi } from './odemeler.servisi';
import { OdemeOlusturmaDto } from '../dtos/odeme.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('odemeler')
@UseGuards(JwtYetkilendirmeKorumasi)
export class OdemeKontrolcusu {
    constructor(private readonly odemeServisi: OdemeServisi) { }

    @Post()
    olustur(@Body(ValidationPipe) odemeOlusturmaDto: OdemeOlusturmaDto) {
        return this.odemeServisi.olustur(odemeOlusturmaDto);
    }

    @Get()
    tumunuGetir(@Query('userId') kullaniciId?: string) {
        if (kullaniciId) {
            return this.odemeServisi.kullaniciyaGoreBul(kullaniciId);
        }
        return this.odemeServisi.tumunuGetir();
    }

    @Get('toplam')
    toplamOdemeleriGetir(@Query('userId') kullaniciId?: string) {
        return this.odemeServisi.toplamOdemeleriGetir(kullaniciId);
    }

    @Get(':id')
    bul(@Param('id') id: string) {
        return this.odemeServisi.bul(id);
    }

    @Delete(':id')
    sil(@Param('id') id: string) {
        return this.odemeServisi.sil(id);
    }
}
