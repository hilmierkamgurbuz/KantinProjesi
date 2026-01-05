import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UygulamaKontrolcusu } from './uygulama.kontrolcusu';
import { UygulamaServisi } from './uygulama.servisi';
import { YetkilendirmeModulu } from './yetkilendirme/yetkilendirme.modulu';
import { KullaniciModulu } from './kullanicilar/kullanicilar.modulu';
import { KategoriModulu } from './kategoriler/kategoriler.modulu';
import { UrunModulu } from './urunler/urunler.modulu';
import { SiparisModulu } from './siparisler/siparisler.modulu';
import { OdemeModulu } from './odemeler/odemeler.modulu';
import { GiderModulu } from './giderler/giderler.modulu';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const mongoUrl = 'mongodb+srv://kantin_db_user:AoEU9K3Tzq4QZJR9@cluster0.ongmz62.mongodb.net/?appName=Cluster0';
                return {
                    type: 'mongodb',
                    url: mongoUrl,
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true, // MongoDB'de şema senkronizasyonu farklı çalışır ama fejlesztirme için açık kalsın
                    useUnifiedTopology: true,
                    useNewUrlParser: true,
                    logging: true,
                };
            },
        }),
        YetkilendirmeModulu,
        KullaniciModulu,
        UrunModulu,
        KategoriModulu,
        SiparisModulu,
        OdemeModulu,
        GiderModulu,
    ],
    controllers: [UygulamaKontrolcusu],
    providers: [UygulamaServisi],
})
export class UygulamaModulu { }
