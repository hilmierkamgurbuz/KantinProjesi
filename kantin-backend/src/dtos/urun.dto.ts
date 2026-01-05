import { IsString, IsNotEmpty, IsUUID, IsArray, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UrunOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    ad: string;

    @IsUUID()
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

    @IsUUID()
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
