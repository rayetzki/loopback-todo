import { IsArray, IsUUID } from "class-validator";
import { Recipe } from "../recipes/recipes.interface";

export class Favourite {
    @IsUUID()
    userId: string;

    @IsUUID()
    recipeId: string;

    @IsArray()
    recipe?: Recipe;
}