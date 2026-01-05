import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class KategoriOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    ad: string;

    @IsString()
    @IsOptional()
    aciklama?: string;
}

export class KategoriGuncellemeDto {
    @IsString()
    @IsOptional()
    ad?: string;

    @IsString()
    @IsOptional()
    aciklama?: string;
}
