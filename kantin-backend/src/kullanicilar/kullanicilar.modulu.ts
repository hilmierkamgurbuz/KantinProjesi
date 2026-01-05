import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KullaniciServisi } from './kullanicilar.servisi';
import { KullaniciKontrolcusu } from './kullanicilar.kontrolcusu';
import { Kullanici } from '../entities/kullanici.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kullanici])],
    controllers: [KullaniciKontrolcusu],
    providers: [KullaniciServisi],
    exports: [KullaniciServisi],
})
export class KullaniciModulu { }
