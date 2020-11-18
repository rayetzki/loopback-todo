import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { from, Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { Recipe } from "src/recipes/recipes.interface";
import { RecipesService } from "src/recipes/recipes.service";
import { User } from "src/user/user.interface";
import { UserService } from "src/user/user.service";
import { DeleteResult, Repository } from "typeorm";
import { FavouritesEntity } from "./favourites.entity";
import { Favourite } from "./favourites.interface";

@Injectable()
export class FavouritesService {
    constructor(
        @InjectRepository(FavouritesEntity) private readonly favouritesRepository: Repository<FavouritesEntity>,
        private readonly userService: UserService,
        private readonly recipesService: RecipesService
    ) { }

    findAll(userId: string): Observable<Favourite[]> {
        return from(this.favouritesRepository.find({
            where: { userId },
            relations: ['addedBy', 'recipe']
        })).pipe(
            map((favourites: Favourite[]) => favourites),
            catchError(error => throwError(error))
        );
    }

    addFavourite(favourite: Favourite): Observable<Favourite> {
        return from(this.userService.findOne(favourite.userId)).pipe(
            switchMap((user: User) => {
                return from(this.recipesService.findOne(favourite.recipeId)).pipe(
                    switchMap((recipe: Recipe) => {
                        return from(this.favouritesRepository.save({
                            ...favourite,
                            recipe,
                            addedBy: user
                        })).pipe(
                            map((favourite: Favourite) => favourite),
                            catchError(error => throwError(error))
                        );
                    })
                )
            })
        );
    }

    removeFavourite(favourite: Favourite): Observable<boolean> {
        return from(this.favouritesRepository.delete(favourite)).pipe(
            map((deleteResult: DeleteResult) => deleteResult.affected === 1 && true),
            catchError(error => throwError(error))
        );
    }
}