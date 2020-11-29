import { UserEntity } from "src/user/user.entity";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { RecipeEntity } from "../recipes/recipes.entity";

@Entity("favourites")
export class FavouritesEntity {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    recipeId: string;

    @ManyToOne(() => UserEntity, user => user.favourites)
    user: UserEntity;

    @ManyToOne(() => RecipeEntity, recipe => recipe.favourite, { onDelete: "CASCADE" })
    recipe: RecipeEntity;
}