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
import { KategoriServisi } from './kategoriler.servisi';
import { KategoriOlusturmaDto, KategoriGuncellemeDto } from '../dtos/kategori.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('kategoriler')
export class KategoriKontrolcusu {
    constructor(private readonly kategoriServisi: KategoriServisi) { }

    @Post()
    @UseGuards(JwtYetkilendirmeKorumasi)
    olustur(@Body(ValidationPipe) kategoriOlusturmaDto: KategoriOlusturmaDto) {
        return this.kategoriServisi.olustur(kategoriOlusturmaDto);
    }

    @Get()
    tumunuGetir() {
        return this.kategoriServisi.tumunuGetir();
    }

    @Get(':id')
    bul(@Param('id') id: string) {
        return this.kategoriServisi.bul(id);
    }

    @Patch(':id')
    @UseGuards(JwtYetkilendirmeKorumasi)
    guncelle(@Param('id') id: string, @Body(ValidationPipe) kategoriGuncellemeDto: KategoriGuncellemeDto) {
        return this.kategoriServisi.guncelle(id, kategoriGuncellemeDto);
    }

    @Delete(':id')
    @UseGuards(JwtYetkilendirmeKorumasi)
    sil(@Param('id') id: string) {
        return this.kategoriServisi.sil(id);
    }
}
