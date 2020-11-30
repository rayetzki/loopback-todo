import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import slugify from "slugify";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, getRepository, Repository, UpdateResult } from "typeorm";
import { from, Observable, of, throwError } from "rxjs";
import { catchError, filter, map, switchMap } from "rxjs/operators";
import { RecipeEntity } from "./recipes.entity";
import { PaginatedRecipes, Recipe, DayTime, DoNotEatAtNight } from "./recipes.interface";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { UserService } from "../user/user.service";
import { User } from "../user/user.interface";
import { FavouritesService } from "src/favourites/favourites.service";

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(RecipeEntity) private readonly recipesRepository: Repository<RecipeEntity>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly userService: UserService,
        private readonly favouritesService: FavouritesService
    ) { }

    findAll(userId: string, limit?: number, page?: number): Observable<PaginatedRecipes> {
        return from(getRepository(RecipeEntity)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.favourite', 'favourites', 'favourites.userId = :userId', { userId })
            .take(limit)
            .skip(page)
            .getManyAndCount()
        ).pipe(
            map(([recipes, count]) => ({
                recipes,
                total: count,
                page,
                limit,
                perPage: page !== 0 ? page * limit : count
            })),
            catchError(error => throwError(error))
        );
    }

    findOne(userId: string, id: string): Observable<Recipe> {
        return from(getRepository(RecipeEntity)
            .createQueryBuilder('recipe')
            .leftJoinAndSelect('recipe.author', 'users')
            .where('recipe.id = :id', { id })
            .leftJoinAndSelect('recipe.favourite', 'favourites', 'favourites.userId = :userId', { userId })
            .getOne()
        );
    }

    findByUser(userId: string, currentUser: string, page: number, limit: number): Observable<PaginatedRecipes> {
        return from(getRepository(RecipeEntity)
            .createQueryBuilder('recipe')
            .leftJoinAndSelect('recipe.author', 'users')
            .leftJoinAndSelect('recipe.favourite', 'favourites', 'favourites.userId = :currentUser', { currentUser })
            .where('recipe.author.id = :userId', { userId })
            .take(limit)
            .skip(page)
            .getManyAndCount()
        ).pipe(
            map(([recipes, count]) => ({
                recipes,
                total: count,
                page,
                limit,
                perPage: page !== 0 ? page * limit : count
            })),
            catchError(error => throwError(error))
        );
    }

    findByDaytime(userId: string, limit?: number, page?: number, dayTime?: DayTime) {
        return from(getRepository(RecipeEntity)
            .createQueryBuilder('recipes')
            .leftJoinAndSelect('recipes.favourite', 'favourites', 'favourites.userId = :userId', { userId })
            .where('recipes.dayTime = :dayTime', { dayTime })
            .take(limit)
            .skip(page)
            .getManyAndCount()
        ).pipe(
            map(([recipes, count]) => ({
                recipes,
                total: count,
                page,
                limit,
                perPage: page !== 0 ? page * limit : count
            })),
            catchError(error => throwError(error))
        );
    }

    search(condition: string): Observable<Recipe[]> {
        return from(getRepository(RecipeEntity)
            .createQueryBuilder('recipe')
            .where('recipe.title ilike :title', { title: `%${condition}%` })
            .orWhere('recipe.description ilike :desciption', { desciption: `%${condition}%` })
            .getMany()
        ).pipe(
            map((recipes: Recipe[]) => recipes),
            catchError(error => throwError(error))
        )
    }

    create(userId: string, recipe: Recipe): Observable<Recipe> {
        return from(this.recipesRepository.findOne({ title: recipe.title })).pipe(
            switchMap((foundRecipe: Recipe) => {
                if (foundRecipe && foundRecipe.title === recipe.title) {
                    throw new BadRequestException('Recipe with such name already exist');
                } else {
                    return from(this.generateSlug(recipe.title)).pipe(
                        switchMap((slug: string) => {
                            return from(this.userService.findOne(userId)).pipe(
                                switchMap((user: User) =>
                                    this.recipesRepository.save({ ...recipe, slug, author: user })
                                )
                            );
                        }),
                        catchError(error => throwError(error))
                    );
                }
            })
        );
    }

    update(id: string, recipe: Recipe): Observable<Recipe> {
        return from(this.recipesRepository.update(id, recipe)).pipe(
            switchMap((updateResult: UpdateResult) => {
                if (updateResult.affected === 1) {
                    return from(this.recipesRepository.findOne(id)).pipe(
                        map((recipe: Recipe) => recipe),
                        catchError(error => throwError(error))
                    )
                }
            }),
            catchError(error => throwError(error))
        );
    }

    delete(id: string): Observable<DeleteResult> {
        return from(this.recipesRepository.delete(id)).pipe(
            switchMap((deleteResult: DeleteResult) => {
                if (deleteResult.affected === 1) {
                    return from(this.favouritesService.removeAll(id)).pipe(
                        map((deleted: DeleteResult) => deleted)
                    )
                }
            }),
            catchError(error => throwError(error))
        );
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }

    async uploadBanner(id: string, file): Promise<Recipe> {
        try {
            const uploadResponse: UploadApiResponse | UploadApiErrorResponse = await this.cloudinaryService.uploadStream('recipes', file);
            if (uploadResponse) {
                const updateResult: UpdateResult = await this.recipesRepository.update(id, { banner: uploadResponse.secure_url })
                if (updateResult.affected === 1) {
                    return this.recipesRepository.findOne(id);
                };
            };
        } catch (error) {
            throw new InternalServerErrorException(`Could not load recipes' banner`);
        }
    };

    recommendRecipe(): Observable<Recipe | DoNotEatAtNight> {
        const now = new Date().getHours();

        let dayTime;
        if (now >= 6 && now <= 9) {
            dayTime = DayTime.BREAKFAST;
        } else if (now > 9 && now <= 11) {
            dayTime = DayTime.SNACK;
        } else if (now > 11 && now <= 13) {
            dayTime = DayTime.LUNCH;
        } else if (now > 13 && now <= 16) {
            dayTime = DayTime.DINNER;
        } else if (now > 16 && now < 19) {
            dayTime = DayTime.DINNER;
        };

        if (dayTime) {
            return from(this.recipesRepository.findAndCount({ where: { dayTime } })).pipe(
                filter(([recipes, count]) => recipes.length > 0 && count > 0),
                map(([recipes, count]) => recipes[Math.floor(Math.random() * count)]),
                catchError(error => throwError(error))
            );
        } else {
            return of({
                message: "Кушать ночью очень вредно для здоровья. Мы рекоммендуем спать в ночное время. Спокойной ночи!"
            })
        }
    }
}