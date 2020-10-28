import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { from, Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { User, UserRole } from "src/user/user.interface";
import { UserService } from "src/user/user.service";
import { Recipe } from "./recipes.interface";
import { RecipesService } from "./recipes.service";

export class AuthorGuard implements CanActivate {
    constructor(
        private readonly userService: UserService,
        private readonly recipesService: RecipesService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const user: User = request.user;
        const recipeId: string = request.params.id;
        return from(this.userService.findOne(user.id)).pipe(
            switchMap((foundUser: User) => {
                return from(this.recipesService.findOne(foundUser.id)).pipe(
                    map((recipe: Recipe) => (
                        recipe.author.id === recipeId &&
                        [UserRole.EDITOR, UserRole.ADMIN].includes(recipe.author.role)
                    )),
                    catchError(error => throwError(error))
                )
            })
        );
    }
}