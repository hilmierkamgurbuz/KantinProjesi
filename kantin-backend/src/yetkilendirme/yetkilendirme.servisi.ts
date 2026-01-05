import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { KullaniciServisi } from '../kullanicilar/kullanicilar.servisi';
import { KayitOlusturmaDto, GirisYapmaDto } from '../dtos/yetkilendirme.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class YetkilendirmeServisi {
    constructor(
        private readonly kullaniciServisi: KullaniciServisi,
        private readonly jwtServisi: JwtService,
    ) { }

    async kayitOl(kayitOlusturmaDto: KayitOlusturmaDto) {
        const mevcutKullanici = await this.kullaniciServisi.telefonIleBul(kayitOlusturmaDto.telefon);
        if (mevcutKullanici) {
            throw new ConflictException('Bu telefon numarası zaten kayıtlı');
        }

        const sifrelenmisSifre = await bcrypt.hash(kayitOlusturmaDto.sifre, 10);

        const kullanici = await this.kullaniciServisi.olustur({
            ...kayitOlusturmaDto,
            sifre: sifrelenmisSifre,
        });

        const jeton = this.jetonUret(kullanici);

        return {
            user: {
                id: kullanici.id,
                firstName: kullanici.ad,
                lastName: kullanici.soyad,
                phone: kullanici.telefon,
                rol: kullanici.rol,
            },
            token: jeton,
        };
    }

    async girisYap(girisYapmaDto: GirisYapmaDto) {
        const kullanici = await this.kullaniciServisi.telefonIleBul(girisYapmaDto.telefon);
        if (!kullanici) {
            throw new UnauthorizedException('Telefon numarası veya şifre hatalı');
        }

        const sifreGecerliMi = await bcrypt.compare(girisYapmaDto.sifre, kullanici.sifre);
        if (!sifreGecerliMi) {
            throw new UnauthorizedException('Telefon numarası veya şifre hatalı');
        }

        const jeton = this.jetonUret(kullanici);

        return {
            user: {
                id: kullanici.id,
                firstName: kullanici.ad,
                lastName: kullanici.soyad,
                phone: kullanici.telefon,
                rol: kullanici.rol,
            },
            token: jeton,
        };
    }

    private jetonUret(kullanici: any) {
        const payload = { sub: kullanici.id, phone: kullanici.telefon, role: kullanici.rol };
        return this.jwtServisi.sign(payload);
    }
}
