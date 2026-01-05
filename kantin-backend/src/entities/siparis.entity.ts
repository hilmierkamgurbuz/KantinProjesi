import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { SiparisOgesi } from './siparis-ogesi.entity';

export enum SiparisTuru {
    VERESIYE = 'credit',
    PESIN = 'cash',
}

@Entity('siparisler')
export class Siparis {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    kullaniciId: string;

    // Non-persisted property for manual population
    kullanici?: any;

    @Column({
        type: 'enum',
        enum: SiparisTuru,
        default: SiparisTuru.VERESIYE,
    })
    tur: SiparisTuru;

    @Column()
    toplamTutar: number;

    @Column({ type: 'text', nullable: true })
    notlar: string;

    @Column((type) => SiparisOgesi)
    ogeler: SiparisOgesi[];

    @CreateDateColumn()
    olusturulmaTarihi: Date;

    @UpdateDateColumn()
    guncellenmeTarihi: Date;
}
