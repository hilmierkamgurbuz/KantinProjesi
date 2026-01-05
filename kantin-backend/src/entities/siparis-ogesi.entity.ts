import { Column } from 'typeorm';

export class SiparisOgesi {
    @Column()
    id: string; // Helper ID for frontend tracking

    // Non-persisted property
    urun?: any;

    @Column()
    urunId: string;

    @Column()
    miktar: number;

    @Column()
    birimFiyat: number;

    @Column()
    toplamFiyat: number;
}
