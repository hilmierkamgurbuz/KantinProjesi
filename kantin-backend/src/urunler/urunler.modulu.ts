import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrunServisi } from './urunler.servisi';
import { UrunKontrolcusu } from './urunler.kontrolcusu';
import { Urun } from '../entities/urun.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Urun])],
    controllers: [UrunKontrolcusu],
    providers: [UrunServisi],
    exports: [UrunServisi],
})
export class UrunModulu { }
