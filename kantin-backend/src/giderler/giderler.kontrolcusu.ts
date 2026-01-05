import { Controller, Get, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { GiderServisi } from './giderler.servisi';
import { GiderOlusturmaDto } from '../dtos/gider.dto';
import { JwtYetkilendirmeKorumasi } from '../yetkilendirme/jwt-yetkilendirme.korumasi';

@Controller('giderler')
@UseGuards(JwtYetkilendirmeKorumasi)
export class GiderKontrolcusu {
    constructor(private readonly giderServisi: GiderServisi) { }

    @Post()
    olustur(@Body(ValidationPipe) giderOlusturmaDto: GiderOlusturmaDto) {
        return this.giderServisi.olustur(giderOlusturmaDto);
    }

    @Get()
    tumunuGetir() {
        return this.giderServisi.tumunuGetir();
    }
}
