import { Entity, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { RecipeEntity } from "../recipes/recipes.entity";
import { UserEntity } from "../user/user.entity";

@Entity("favourites")
export class FavouritesEntity {
    @PrimaryColumn()
    userId: string;

    @PrimaryColumn()
    recipeId: string;

    @ManyToOne(() => UserEntity, user => user.favourites, { onDelete: "CASCADE" })
    addedBy: UserEntity;

    @OneToOne(() => RecipeEntity, recipe => recipe.favourite, { onDelete: "CASCADE" })
    recipe: RecipeEntity;
}