import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiparisServisi } from './siparisler.servisi';
import { SiparisKontrolcusu } from './siparisler.kontrolcusu';
import { Siparis } from '../entities/siparis.entity';
import { SiparisOgesi } from '../entities/siparis-ogesi.entity';
import { KullaniciModulu } from '../kullanicilar/kullanicilar.modulu';
import { UrunModulu } from '../urunler/urunler.modulu';

@Module({
    imports: [
        TypeOrmModule.forFeature([Siparis, SiparisOgesi]),
        KullaniciModulu,
        UrunModulu,
    ],
    controllers: [SiparisKontrolcusu],
    providers: [SiparisServisi],
    exports: [SiparisServisi],
})
export class SiparisModulu { }
