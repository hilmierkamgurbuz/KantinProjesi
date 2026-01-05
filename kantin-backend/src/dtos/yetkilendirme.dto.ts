import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { KullaniciRolu } from '../entities/kullanici.entity';

export class KayitOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    ad: string;

    @IsString()
    @IsNotEmpty()
    soyad: string;

    @IsString()
    @IsNotEmpty()
    telefon: string;

    @IsString()
    @MinLength(6)
    sifre: string;

    @IsEnum(KullaniciRolu)
    @IsOptional()
    rol?: KullaniciRolu;
}

export class GirisYapmaDto {
    @IsString()
    @IsNotEmpty()
    telefon: string;

    @IsString()
    @IsNotEmpty()
    sifre: string;
}
