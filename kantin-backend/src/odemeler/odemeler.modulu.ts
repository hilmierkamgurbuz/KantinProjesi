import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OdemeServisi } from './odemeler.servisi';
import { OdemeKontrolcusu } from './odemeler.kontrolcusu';
import { Odeme } from '../entities/odeme.entity';
import { KullaniciModulu } from '../kullanicilar/kullanicilar.modulu';

@Module({
    imports: [
        TypeOrmModule.forFeature([Odeme]),
        KullaniciModulu,
    ],
    controllers: [OdemeKontrolcusu],
    providers: [OdemeServisi],
    exports: [OdemeServisi],
})
export class OdemeModulu { }
