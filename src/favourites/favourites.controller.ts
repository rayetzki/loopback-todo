import { Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { from, Observable } from 'rxjs';
import { IsUserGuard, JwtAuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/user.interface';
import { Favourite } from './favourites.interface';
import { FavouritesService } from './favourites.service';

@ApiTags('favourites')
@ApiBearerAuth()
@Controller('favourites')
export class FavouritesController {
    constructor(private readonly favouritesService: FavouritesService) { }

    @Get()
    @UseGuards(JwtAuthGuard, IsUserGuard)
    findAll(@Req() request: Request): Observable<Favourite[]> {
        const user: User = request.user;
        return from(this.favouritesService.findAll(user.id));
    }

    @Post()
    @ApiQuery({ description: "Desired recipe id to add to favourites", name: 'recipeId', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    addFavourite(
        @Req() request: Request,
        @Query('recipeId') recipeId: string
    ): Observable<Favourite> {
        const user: User = request.user;
        return from(this.favouritesService.addFavourite({ userId: user.id, recipeId }));
    }

    @Delete()
    @ApiQuery({ description: "Recipe id to remove from favourites", name: 'recipeId', type: 'string', required: true })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    removeFavourite(
        @Req() request: Request,
        @Query('recipeId') recipeId: string
    ): Observable<boolean> {
        const user: User = request.user;
        return from(this.favouritesService.removeFavourite({ userId: user.id, recipeId }));
    }
}
