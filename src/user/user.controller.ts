import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginatedUsers, User, UserRole } from './user.interface';
import { UserService } from './user.service';
import { JwtToken } from '../auth/auth.interface';
import { Roles } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/role.guard';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAll(@Query() query): Observable<PaginatedUsers> {
        const limit: number = query.limit || 0;
        const offset: number = query.offset || 0;
        return from(this.userService.findAll(limit, offset));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Observable<User> {
        return from(this.userService.findOne(id));
    }

    @Post()
    create(@Body() user: User): Observable<User | unknown> {
        return from(this.userService.create(user)).pipe(
            map((user: User) => user),
            catchError(error => of({ error: error.message }))
        );
    }

    @Post('/login')
    login(@Body() user: User): Observable<JwtToken | unknown> {
        return this.userService.login(user.email, user.password).pipe(
            map((jwt: string): JwtToken => ({ accessToken: jwt })),
            catchError(error => of({ error: error.message }))
        );
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() user: User): Observable<UpdateResult> {
        return from(this.userService.updateOne(id, user));
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    delete(@Param('id') id: string): Observable<DeleteResult> {
        return from(this.userService.deleteOne(id));
    }

    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRole(@Param('id') id: string, @Body() user: User): Observable<UpdateResult> {
        return from(this.userService.updateRole(id, user))
    }
}
