import {
    Entity,
    ObjectIdColumn,
    ObjectId,
    Column,
    CreateDateColumn,
} from 'typeorm';

@Entity('odemeler')
export class Odeme {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    kullaniciId: string;

    @Column()
    tutar: number;

    @Column({ type: 'text', nullable: true })
    notlar: string;

    @CreateDateColumn()
    olusturulmaTarihi: Date;
}
