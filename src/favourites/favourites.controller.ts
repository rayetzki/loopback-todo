import { Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { from, Observable } from 'rxjs';
import { IsUserGuard, JwtAuthGuard } from 'src/auth/auth.guard';
import { Favourite } from './favourites.interface';
import { FavouritesService } from './favourites.service';

@ApiTags('favourites')
@ApiBearerAuth()
@Controller('favourites')
export class FavouritesController {
    constructor(private readonly favouritesService: FavouritesService) { }

    @Get()
    @ApiQuery({ description: "Currently authenticated user", name: 'userId', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    findAll(@Query('userId') userId: string): Observable<Favourite[]> {
        return from(this.favouritesService.findAll(userId));
    }

    @Post()
    @ApiQuery({ description: "Desired recipe id to add to favourites", name: 'recipeId', type: 'string', required: true })
    @ApiQuery({ description: "Currently authenticated user", name: 'userId', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    addFavourite(
        @Query('userId') userId: string,
        @Query('recipeId') recipeId: string
    ): Observable<Favourite> {
        return from(this.favouritesService.addFavourite({ userId, recipeId }));
    }

    @Delete()
    @ApiQuery({ description: "Recipe id to remove from favourites", name: 'recipeId', type: 'string', required: true })
    @ApiQuery({ description: "Currently authenticated user", name: 'userId', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    removeFavourite(
        @Query('userId') userId: string,
        @Query('recipeId') recipeId: string
    ): Observable<boolean> {
        return from(this.favouritesService.removeFavourite({ userId, recipeId }));
    }
}
