import { IsString, IsNotEmpty, IsUUID, IsEnum, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SiparisTuru } from '../entities/siparis.entity';

export class SiparisOgesiDto {
    @IsUUID()
    @IsNotEmpty()
    urunId: string;

    @IsNumber()
    @Min(1)
    miktar: number;

    @IsNumber()
    @Min(0)
    birimFiyat: number;
}

export class SiparisOlusturmaDto {
    @IsUUID()
    @IsNotEmpty()
    kullaniciId: string;

    @IsEnum(SiparisTuru)
    @IsOptional()
    tur?: SiparisTuru;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SiparisOgesiDto)
    ogeler: SiparisOgesiDto[];

    @IsString()
    @IsOptional()
    notlar?: string;
}
