import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipes.service";
import { Recipe } from "./recipes.interface";
import { IsUserGuard, JwtAuthGuard } from "../auth/auth.guard";

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    find(
        @Query('id') id?: string,
        @Query('userId') userId?: string
    ): Observable<Recipe[] | Recipe> {
        if (id) {
            return from(this.recipesService.findOne(id));
        } else if (userId) {
            return from(this.recipesService.findByUser(userId));
        } else {
            return from(this.recipesService.findAll());
        };
    }

    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post()
    create(@Body() recipe: Recipe): Observable<Recipe> {
        return from(this.recipesService.create(recipe));
    }
}