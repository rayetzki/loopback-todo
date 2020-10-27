import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "./user.interface";
import { RecipeEntity } from "../recipes/recipes.entity";

@Entity("users")
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    nutrition: string;

    @Column()
    age: number;

    @Column({ unique: true })
    email: string;

    @Column({ default: "" })
    avatar: string;

    @Column({ select: false })
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @OneToMany(() => RecipeEntity, recipe => recipe.author)
    recipes: RecipeEntity[];
}