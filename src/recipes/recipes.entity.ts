import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { NutritionType, RecipeIngredients } from "./recipes.interface";
import { UserEntity } from "../user/user.entity";

@Entity("recipes")
export class RecipeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    title: string;

    @Column()
    slug: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }

    @Column({ type: "varchar" })
    description: string;

    @Column('jsonb')
    ingredients: RecipeIngredients[];

    @Column()
    cost: string;

    @Column()
    cookingTime: string;

    @Column()
    body: string;

    @Column({ default: NutritionType.ANY })
    nutritionType: NutritionType;

    @ManyToOne(() => UserEntity, user => user.recipes)
    author: UserEntity;
}