import { Entity, OneToOne, PrimaryColumn } from "typeorm";
import { RecipeEntity } from "../recipes/recipes.entity";

@Entity("favourites")
export class FavouritesEntity {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    recipeId: string;

    @OneToOne(() => RecipeEntity, recipe => recipe.favourite)
    recipe: RecipeEntity;
}