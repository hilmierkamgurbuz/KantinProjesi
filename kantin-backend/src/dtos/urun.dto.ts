import { IsString, IsNotEmpty, IsUUID, IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UrunOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    ad: string;

    @IsString()
    @IsNotEmpty()
    kategoriId: string;

    @IsArray()
    @IsOptional()
    fiyatSecenekleri?: number[];

    @IsBoolean()
    @IsOptional()
    manuelFiyatVarMi?: boolean;

    @IsNumber()
    @IsOptional()
    varsayilanFiyat?: number;
}

export class UrunGuncellemeDto {
    @IsString()
    @IsOptional()
    ad?: string;

    @IsString()
    @IsOptional()
    kategoriId?: string;

    @IsArray()
    @IsOptional()
    fiyatSecenekleri?: number[];

    @IsBoolean()
    @IsOptional()
    manuelFiyatVarMi?: boolean;

    @IsNumber()
    @IsOptional()
    varsayilanFiyat?: number;

    @IsBoolean()
    @IsOptional()
    aktifMi?: boolean;
}
