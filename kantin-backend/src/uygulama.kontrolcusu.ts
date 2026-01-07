import { Controller, Get } from '@nestjs/common';
import { UygulamaServisi } from './uygulama.servisi';

@Controller()
export class UygulamaKontrolcusu {
    constructor(private readonly uygulamaServisi: UygulamaServisi) { }

    @Get()
    merhabaDe(): string {
        return this.uygulamaServisi.merhabaDe();
    }

    @Get('ping')
    ping(): string {
        return 'pong';
    }
}
