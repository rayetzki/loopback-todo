import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipes.service";
import { DoNotEatAtNight, PaginatedRecipes, Recipe, RecipeBanner } from "./recipes.interface";
import { IsUserGuard, JwtAuthGuard } from "../auth/auth.guard";
import { DeleteResult } from "typeorm";
import { AuthorGuard } from "./recipes.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

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
        @Query('userId') userId?: string,
        @Query('page') page = 0,
        @Query('limit') limit = 0
    ): Observable<PaginatedRecipes | Recipe> {
        if (id) {
            return from(this.recipesService.findOne(id));
        } else if (userId) {
            return from(this.recipesService.findByUser(userId, limit, page));
        } else {
            return from(this.recipesService.findAll(limit, page));
        };
    }

    @ApiBody({ type: () => Recipe })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post()
    @UsePipes(ValidationPipe)
    create(
        @Query('userId') userId: string,
        @Body() recipe: Recipe
    ): Observable<Recipe> {
        return from(this.recipesService.create(userId, recipe));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard, AuthorGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() recipe: Recipe): Observable<Recipe> {
        return from(this.recipesService.update(id, recipe));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard, AuthorGuard)
    @Delete(':id')
    delete(@Param('id') id: string): Observable<DeleteResult> {
        return from(this.recipesService.delete(id));
    }

    @ApiQuery({ name: 'id', type: 'string', required: true })
    @ApiBody({ description: 'User avatar', type: RecipeBanner })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('banner'))
    @Post('/banner')
    uploadBanner(
        @Query('id') id: string,
        @UploadedFile() file
    ): Promise<Recipe> {
        return this.recipesService.uploadBanner(id, file);
    }

    @ApiResponse({ status: 200, description: "Random recipe dependent on a daytime" })
    @UseGuards(JwtAuthGuard)
    @Get('/recommendation')
    recommendedRecipe(): Observable<Recipe | DoNotEatAtNight> {
        return from(this.recipesService.recommendRecipe());
    }
}