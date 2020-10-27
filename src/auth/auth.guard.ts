import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { User, UserRole } from "src/user/user.interface";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }

@Injectable()
export class IsUserGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService
    ) {

    }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const user: User = request.user;
        const userId: string = request.params.id;

        return from(this.userService.findOne(user.id)).pipe(
            map((user: User) => (user.id === userId && user.role === UserRole.USER) ? true : false),
            catchError(error => throwError(error))
        )
    }
}
