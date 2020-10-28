import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { from, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import slugify from "slugify";
import { Repository } from "typeorm";
import { User } from "../user/user.interface";
import { RecipeEntity } from "./recipes.entity";
import { Recipe } from "./recipes.interface";

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(RecipeEntity) private readonly recipesRepository: Repository<RecipeEntity>
    ) { }

    findAll(): Observable<Recipe[]> {
        return from(this.recipesRepository.find({ relations: ['author'] }));
    }

    findOne(id: string): Observable<Recipe> {
        return from(this.recipesRepository.findOne(id, { relations: ['author'] }));
    }

    findByUser(userId: string): Observable<Recipe[]> {
        return from(this.recipesRepository.find({
            where: { author: userId },
            relations: ['author']
        })).pipe(
            map((recipes: Recipe[]) => recipes),
            catchError(error => throwError(error))
        )
    }

    create(user: User, recipe: Recipe): Observable<Recipe> {
        return from(this.generateSlug(recipe.title)).pipe(
            switchMap((slug: string) => {
                return from(this.recipesRepository.save({ ...recipe, slug, author: user }));
            }),
            catchError(error => throwError(error))
        );
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }
}