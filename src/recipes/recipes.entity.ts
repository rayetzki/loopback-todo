import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DayTime, NutritionType, RecipeIngredients } from "./recipes.interface";
import { UserEntity } from "../user/user.entity";
import { FavouritesEntity } from "../favourites/favourites.entity";

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

    @Column({ type: "jsonb" })
    ingredients: RecipeIngredients[];

    @Column()
    cost: string;

    @Column()
    cookingTime: string;

    @Column()
    body: string;

    @Column({ default: '' })
    banner: string;

    @Column({ type: "enum", enum: NutritionType, default: NutritionType.ANY })
    nutritionType: NutritionType;

    @Column({ type: "enum", enum: DayTime, default: DayTime.LUNCH })
    dayTime: DayTime;

    @ManyToOne(() => UserEntity, user => user.recipes, { onDelete: "CASCADE" })
    author: UserEntity;

    @ManyToOne(() => FavouritesEntity, favourites => favourites.recipe, { onDelete: "CASCADE" })
    favourite: FavouritesEntity;
}