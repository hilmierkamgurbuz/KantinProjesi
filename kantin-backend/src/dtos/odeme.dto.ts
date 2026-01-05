import { IsString, IsNotEmpty, IsUUID, IsNumber, IsOptional, Min } from 'class-validator';

export class OdemeOlusturmaDto {
    @IsUUID()
    @IsNotEmpty()
    kullaniciId: string;

    @IsNumber()
    @Min(0.01)
    tutar: number;

    @IsString()
    @IsOptional()
    notlar?: string;
}
