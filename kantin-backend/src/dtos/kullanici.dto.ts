import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { KullaniciRolu } from '../entities/kullanici.entity';

export class KullaniciOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    ad: string;

    @IsString()
    @IsNotEmpty()
    soyad: string;

    @IsString()
    @IsNotEmpty()
    telefon: string;

    @IsEnum(KullaniciRolu)
    @IsOptional()
    rol?: KullaniciRolu;
}

export class KullaniciGuncellemeDto {
    @IsString()
    @IsOptional()
    ad?: string;

    @IsString()
    @IsOptional()
    soyad?: string;

    @IsString()
    @IsOptional()
    telefon?: string;

    @IsBoolean()
    @IsOptional()
    aktifMi?: boolean;

    @IsNumber()
    @IsOptional()
    bakiye?: number;
}
