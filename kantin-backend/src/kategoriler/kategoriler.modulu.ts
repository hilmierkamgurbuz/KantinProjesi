import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriServisi } from './kategoriler.servisi';
import { KategoriKontrolcusu } from './kategoriler.kontrolcusu';
import { Kategori } from '../entities/kategori.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kategori])],
    controllers: [KategoriKontrolcusu],
    providers: [KategoriServisi],
    exports: [KategoriServisi],
})
export class KategoriModulu { }
