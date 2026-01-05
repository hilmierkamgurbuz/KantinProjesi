import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ValidationPipe
} from '@nestjs/common';
import { UrunServisi } from './urunler.servisi';
import { UrunOlusturmaDto, UrunGuncellemeDto } from '../dtos/urun.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('urunler')
@UseGuards(JwtYetkilendirmeKorumasi)
export class UrunKontrolcusu {
    constructor(private readonly urunServisi: UrunServisi) { }

    @Post()
    olustur(@Body(ValidationPipe) urunOlusturmaDto: UrunOlusturmaDto) {
        return this.urunServisi.olustur(urunOlusturmaDto);
    }

    @Get()
    tumunuGetir(@Query('kategoriId') kategoriId?: string) {
        if (kategoriId) {
            return this.urunServisi.kategorisineGoreBul(kategoriId);
        }
        return this.urunServisi.tumunuGetir();
    }

    @Get(':id')
    bul(@Param('id') id: string) {
        return this.urunServisi.bul(id);
    }

    @Patch(':id')
    guncelle(@Param('id') id: string, @Body(ValidationPipe) urunGuncellemeDto: UrunGuncellemeDto) {
        return this.urunServisi.guncelle(id, urunGuncellemeDto);
    }

    @Delete(':id')
    sil(@Param('id') id: string) {
        return this.urunServisi.sil(id);
    }
}
