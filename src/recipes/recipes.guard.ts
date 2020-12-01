import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { User } from "src/user/user.interface";
import { Recipe } from "./recipes.interface";
import { RecipesService } from "./recipes.service";

@Injectable()
export class AuthorGuard implements CanActivate {
    constructor(
        private readonly recipesService: RecipesService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const user: User = request.user;
        const recipeId = request.query.id as string;

        return from(this.recipesService.findAuthorRecipe(recipeId, user.id)).pipe(
            map((recipe: Recipe) => {
                if (!recipe) throw new BadRequestException("You didn't add this recipe");
                else return true;
            }),
            catchError(error => throwError(error))
        )
    }
}