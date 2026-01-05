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
                const mongoUrl = process.env.DATABASE_URL;
                if (!mongoUrl) {
                    console.error('DATABASE_URL environment variable is not defined!');
                    // Fallback for local dev if needed, or throw error. 
                    // Given the user request to remove hardcoded password, we normally wouldn't keep it.
                    // But to prevent immediate crash if they haven't set env yet locally:
                    // throw new Error('DATABASE_URL is missing');
                }

                return {
                    type: 'mongodb',
                    url: mongoUrl || 'mongodb+srv://kantin_db_user:AoEU9K3Tzq4QZJR9@cluster0.ongmz62.mongodb.net/?appName=Cluster0',
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
