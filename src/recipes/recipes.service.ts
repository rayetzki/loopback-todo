import { Inject, Injectable, Scope } from "@nestjs/common";
import slugify from "slugify";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { from, Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { User } from "../user/user.interface";
import { RecipeEntity } from "./recipes.entity";
import { Recipe } from "./recipes.interface";

@Injectable({ scope: Scope.REQUEST })
export class RecipesService {
    constructor(
        @InjectRepository(RecipeEntity) private readonly recipesRepository: Repository<RecipeEntity>,
        @Inject(REQUEST) private readonly request: Request
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

    create(recipe: Recipe): Observable<Recipe> {
        const user: User = this.request.user;
        return from(this.generateSlug(recipe.title)).pipe(
            switchMap((slug: string) => {
                return from(this.recipesRepository.save({ ...recipe, slug, author: user }));
            }),
            catchError(error => throwError(error))
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
        )
    }

    delete(id: string): Observable<DeleteResult> {
        return from(this.recipesRepository.delete(id)).pipe(
            map((deleteResult: DeleteResult) => deleteResult),
            catchError(error => throwError(error))
        )
    }

    generateSlug(title: string): Observable<string> {
        return of(slugify(title));
    }
}