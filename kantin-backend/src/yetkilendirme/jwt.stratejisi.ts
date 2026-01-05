import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { KullaniciServisi } from '../kullanicilar/kullanicilar.servisi';

@Injectable()
export class JwtStratejisi extends PassportStrategy(Strategy) {
    constructor(
        private kullaniciServisi: KullaniciServisi,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'kantin-super-secret-key-2024',
        });
    }

    async validate(payload: any) {
        const kullanici = await this.kullaniciServisi.bul(payload.sub);
        if (!kullanici) {
            throw new UnauthorizedException();
        }
        return kullanici;
    }
}
