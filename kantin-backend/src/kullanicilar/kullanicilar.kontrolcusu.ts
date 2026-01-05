import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ValidationPipe
} from '@nestjs/common';
import { KullaniciServisi } from './kullanicilar.servisi';
import { KullaniciOlusturmaDto, KullaniciGuncellemeDto } from '../dtos/kullanici.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('kullanicilar')
@UseGuards(JwtYetkilendirmeKorumasi)
export class KullaniciKontrolcusu {
    constructor(private readonly kullaniciServisi: KullaniciServisi) { }

    @Post()
    olustur(@Body(ValidationPipe) kullaniciOlusturmaDto: KullaniciOlusturmaDto) {
        return this.kullaniciServisi.olustur(kullaniciOlusturmaDto);
    }

    @Get()
    tumunuGetir() {
        return this.kullaniciServisi.tumunuGetir();
    }

    @Get(':id')
    bul(@Param('id') id: string) {
        return this.kullaniciServisi.bul(id);
    }

    @Get(':id/bakiye')
    bakiyeGetir(@Param('id') id: string) {
        return this.kullaniciServisi.kullaniciBakiyesiniGetir(id);
    }

    @Patch(':id')
    guncelle(@Param('id') id: string, @Body(ValidationPipe) kullaniciGuncellemeDto: KullaniciGuncellemeDto) {
        return this.kullaniciServisi.guncelle(id, kullaniciGuncellemeDto);
    }

    @Delete(':id')
    sil(@Param('id') id: string) {
        return this.kullaniciServisi.sil(id);
    }
}
