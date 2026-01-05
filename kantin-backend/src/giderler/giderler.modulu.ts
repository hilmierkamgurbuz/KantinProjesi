import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiderServisi } from './giderler.servisi';
import { GiderKontrolcusu } from './giderler.kontrolcusu';
import { Gider } from '../entities/gider.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Gider])],
    controllers: [GiderKontrolcusu],
    providers: [GiderServisi],
})
export class GiderModulu { }
