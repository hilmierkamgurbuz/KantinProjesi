import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum KullaniciRolu {
    YONETICI = 'admin',
    KULLANICI = 'user',
    PESIN_MUSTERI = 'cash_customer',
}

@Entity('kullanicilar')
export class Kullanici {
    @ObjectIdColumn()
    _id: ObjectId;

    @Column()
    id: string; // Sanal id alanı veya string olarak saklanan id

    @Column()
    ad: string;

    @Column()
    soyad: string;

    @Column({ unique: true })
    telefon: string;

    @Column({ select: false, nullable: true })
    sifre: string;

    @Column({
        type: 'enum',
        enum: KullaniciRolu,
        default: KullaniciRolu.KULLANICI,
    })
    rol: KullaniciRolu;

    @Column()
    bakiye: number;

    @Column({ default: true })
    aktifMi: boolean;

    @CreateDateColumn()
    olusturulmaTarihi: Date;

    @UpdateDateColumn()
    guncellenmeTarihi: Date;
}
