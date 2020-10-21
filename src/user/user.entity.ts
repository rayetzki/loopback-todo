import { BeforeInsert, Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
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
    email: string;

    @Column()
    password: string;

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}