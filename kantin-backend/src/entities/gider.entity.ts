import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn } from 'typeorm';

@Entity('giderler')
export class Gider {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    aciklama: string;

    @Column()
    tutar: number;

    @CreateDateColumn()
    olusturulmaTarihi: Date;
}
