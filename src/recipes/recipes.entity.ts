import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NutritionType, RecipeIngredients } from "./recipes.interface";
import { UserEntity } from "../user/user.entity";

@Entity("recipes")
export class RecipeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ type: "varchar" })
    description: string;

    @Column({ type: "simple-array" })
    ingredients: RecipeIngredients[];

    @Column()
    cost: string;

    @Column()
    cookingTime: string;

    @Column({ default: NutritionType.ANY })
    nutritionType: NutritionType;

    @ManyToOne(() => UserEntity, user => user.id)
    user: UserEntity;
}