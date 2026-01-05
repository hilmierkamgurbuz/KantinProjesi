import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class GiderOlusturmaDto {
    @IsString()
    @IsNotEmpty()
    aciklama: string;

    @IsNumber()
    @Min(0)
    tutar: number;
}
