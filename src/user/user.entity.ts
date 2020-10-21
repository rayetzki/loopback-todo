import { Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn()
    @Generated('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    nutrition: string;

    @Column()
    age: number;

    @Column()
    password: string;
}