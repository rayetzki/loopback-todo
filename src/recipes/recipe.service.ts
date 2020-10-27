import { Injectable } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { Repository } from "typeorm";
import { RecipeEntity } from "./recipes.entity";
import { Recipe } from "./recipes.interface";

@Injectable()
export class RecipesService {
    constructor(private readonly recipeRepository: Repository<RecipeEntity>) { }

    create(recipe: Recipe): Observable<Recipe> {
        return from(this.recipeRepository.save(recipe));
    }
}