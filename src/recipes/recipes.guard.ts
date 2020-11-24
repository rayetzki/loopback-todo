import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { User, UserRole } from "src/user/user.interface";
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
        const recipeId: string = request.params.id;

        return from(this.recipesService.findOne(recipeId)).pipe(
            map((recipe: Recipe) => {
                if (!recipe) {
                    throw new BadRequestException("Recipe doesn't exist");
                } else if (
                    recipe.author.id === user.id &&
                    [UserRole.EDITOR, UserRole.ADMIN].includes(recipe.author.role)
                ) {
                    return true;
                } else return false
            }),
            catchError(error => throwError(error))
        )
    }
}