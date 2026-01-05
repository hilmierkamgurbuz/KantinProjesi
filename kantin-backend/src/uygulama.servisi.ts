import { Injectable } from '@nestjs/common';

@Injectable()
export class UygulamaServisi {
    merhabaDe(): string {
        return 'Merhaba Dünya!';
    }
}
