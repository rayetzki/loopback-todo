import { Body, Controller, Post } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipe.service";
import { Recipe } from "./recipes.interface";

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @Post()
    create(@Body() recipe: Recipe): Observable<Recipe> {
        return from(this.recipesService.create(recipe));
    }
}