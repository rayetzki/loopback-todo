import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipes.service";
import { Recipe } from "./recipes.interface";
import { IsUserGuard, JwtAuthGuard } from "../auth/auth.guard";
import { DeleteResult } from "typeorm";
import { AuthorGuard } from "./author.guard";
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiTags('recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @ApiQuery({ name: 'id', type: 'string', required: false })
    @ApiQuery({ name: 'userId', type: 'string', required: false })
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

    @ApiBody({ type: () => Recipe })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post()
    @UsePipes(ValidationPipe)
    create(@Body() recipe: Recipe): Observable<Recipe> {
        return from(this.recipesService.create(recipe));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard, AuthorGuard)
    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() recipe: Recipe): Observable<Recipe> {
        return from(this.recipesService.update(id, recipe));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard, AuthorGuard)
    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string): Observable<DeleteResult> {
        return from(this.recipesService.delete(id));
    }
}