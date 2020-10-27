import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NutritionType, RecipeIngredients } from "./recipes.interface";

@Entity('recipes')
export class RecipeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ type: "varchar" })
    description: string;

    @Column({ type: "array" })
    ingredients: Array<RecipeIngredients>;

    @Column()
    cost: string;

    @Column()
    cookingTime: string;

    @Column({ default: NutritionType.ANY })
    nutritionType: NutritionType;
}