import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { YetkilendirmeServisi } from './yetkilendirme.servisi';
import { YetkilendirmeKontrolcusu } from './yetkilendirme.kontrolcusu';
import { KullaniciModulu } from '../kullanicilar/kullanicilar.modulu';
import { JwtStratejisi } from './jwt.stratejisi';

@Module({
    imports: [
        KullaniciModulu,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') || 'kantin-super-secret-key-2024',
                signOptions: { expiresIn: '7d' },
            }),
        }),
    ],
    controllers: [YetkilendirmeKontrolcusu],
    providers: [YetkilendirmeServisi, JwtStratejisi],
    exports: [YetkilendirmeServisi],
})
export class YetkilendirmeModulu { }
