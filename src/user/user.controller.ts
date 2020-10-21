import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { JwtToken } from '../auth/auth.interface';
import { UpdateResult } from 'typeorm';
import { User } from './user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    findAll(): Observable<User[]> {
        return from(this.userService.findAll());
    }

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
    login(@Body() email: string, password: string): Observable<JwtToken> {
        return from(this.userService.login({ email, password })).pipe(
            map((jwt: string) => ({ accessToken: jwt }))
        );
    }

    @Put(':id')
    updateOne(@Param('id') id: string, @Body() user: User): Observable<UpdateResult> {
        return from(this.userService.updateOne(id, user));
    }
}
