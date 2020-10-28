import { Body, Controller, Get, Post, Query, Request, UseGuards } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipes.service";
import { Recipe } from "./recipes.interface";
import { IsUserGuard, JwtAuthGuard } from "../auth/auth.guard";
import { User } from "src/user/user.interface";

@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    find(@Query() query: { id?: string, userId?: string }): Observable<Recipe[] | Recipe> {
        if (query?.id) {
            return from(this.recipesService.findOne(query.id));
        } else if (query?.userId) {
            return from(this.recipesService.findByUser(query.userId));
        } else {
            return from(this.recipesService.findAll());
        }
    }

    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post()
    create(@Body() recipe: Recipe, @Request() request): Observable<Recipe> {
        const user: User = request.user;
        return from(this.recipesService.create(user, recipe));
    }
}