import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('kategoriler')
export class Kategori {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ unique: true })
    ad: string;

    @Column({ nullable: true })
    aciklama: string;

    @CreateDateColumn()
    olusturulmaTarihi: Date;

    @UpdateDateColumn()
    guncellenmeTarihi: Date;
}
