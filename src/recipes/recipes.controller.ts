import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { from, Observable } from "rxjs";
import { RecipesService } from "./recipes.service";
import { DayTime, DoNotEatAtNight, PaginatedRecipes, Recipe, RecipeBanner } from "./recipes.interface";
import { IsUserGuard, JwtAuthGuard } from "../auth/auth.guard";
import { AuthorGuard } from "./recipes.guard";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { DeleteResult } from "typeorm";
import { Request } from "express";
import { User } from "src/user/user.interface";

@ApiTags('recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @ApiQuery({ name: 'id', type: 'string', required: false })
    @ApiQuery({ name: 'dayTime', type: 'enum', required: false })
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @UseGuards(JwtAuthGuard)
    @Get()
    find(
        @Req() request: Request,
        @Query('id') id?: string,
        @Query('dayTime') dayTime?: DayTime,
        @Query('page') page = 0,
        @Query('limit') limit = 0,
    ): Observable<PaginatedRecipes | Recipe> {
        const user: User = request.user;

        if (id) {
            return from(this.recipesService.findOne(user.id, id));
        } else if (dayTime) {
            return from(this.recipesService.findByDaytime(user.id, limit, page, dayTime));
        } else {
            return from(this.recipesService.findAll(user.id, Number(limit), Number(page)));
        };
    }

    @ApiQuery({ name: 'userId', type: 'string', required: true })
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @Get('/byUser')
    @UseGuards(JwtAuthGuard)
    findByUser(
        @Req() request: Request,
        @Query('userId') userId: string,
        @Query('page') page = 0,
        @Query('limit') limit = 0
    ) {
        const currentUser: User = request.user;
        return from(this.recipesService.findByUser(userId, currentUser.id, Number(page), Number(limit)));
    }

    @ApiBody({ type: () => Recipe })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post()
    @UsePipes(ValidationPipe)
    create(
        @Req() request: Request,
        @Body() recipe: Recipe
    ): Observable<Recipe> {
        const user: User = request.user;
        return from(this.recipesService.create(user.id, recipe));
    }

    @ApiResponse({ status: 200, description: "Recipes dependent on the provided string" })
    @ApiQuery({ name: "condition", description: "Search condition" })
    @UseGuards(JwtAuthGuard)
    @Get('/search')
    search(@Query('condition') condition: string): Observable<Recipe[]> {
        return from(this.recipesService.search(condition));
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
    @UseGuards(JwtAuthGuard, IsUserGuard, AuthorGuard)
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