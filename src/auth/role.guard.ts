import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { User } from "../user/user.interface";
import { UserService } from "../user/user.service";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @Inject(forwardRef(() => UserService))
        private userService: UserService
    ) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles: string[] = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles || roles.length === 0) return true;
        const request: Request = context.switchToHttp().getRequest();
        const user: User = request.user;

        return from(this.userService.findOne(user.id).pipe(
            map((user: User) => roles.includes(user.role) ? true : false),
            catchError(error => throwError(error)))
        )
    }
}