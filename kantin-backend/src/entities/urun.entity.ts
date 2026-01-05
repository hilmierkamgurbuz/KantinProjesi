import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('urunler')
export class Urun {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    ad: string;

    @Column()
    kategoriId: string;

    @Column('simple-array', { nullable: true })
    fiyatSecenekleri: number[];

    @Column({ default: false })
    manuelFiyatVarMi: boolean;

    @Column()
    varsayilanFiyat: number;

    @Column({ default: true })
    aktifMi: boolean;

    @CreateDateColumn()
    olusturulmaTarihi: Date;

    @UpdateDateColumn()
    guncellenmeTarihi: Date;
}
