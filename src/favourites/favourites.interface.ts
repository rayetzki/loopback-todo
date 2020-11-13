import { IsArray, IsObject, IsUUID } from "class-validator";
import { Recipe } from "../recipes/recipes.interface";
import { User } from "../user/user.interface";

export class Favourite {
    @IsUUID()
    userId: string;

    @IsUUID()
    recipeId: string;

    @IsObject()
    addedBy?: User;

    @IsArray()
    recipe?: Recipe[];
}