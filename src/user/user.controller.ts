import { Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginatedUsers, User, UserRole, UserAvatar, UserCredentials } from './user.interface';
import { UserService } from './user.service';
import { JwtToken } from '../auth/auth.interface';
import { Roles } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/role.guard';
import { IsUserGuard, JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @ApiQuery({ name: 'id', type: 'string', required: false })
    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAll(
        @Query('limit', ParseIntPipe) limit = 0,
        @Query('page', ParseIntPipe) page = 0,
        @Query('id', ParseUUIDPipe) id: string
    ): Observable<PaginatedUsers | User> {
        if (id) {
            return from(this.userService.findOne(id));
        } else {
            return from(this.userService.findAll(limit, page));
        }
    }

    @ApiQuery({ name: 'name', type: 'string', required: true })
    @UseGuards(JwtAuthGuard)
    @Get('/search')
    search(@Query('name') name: string): Observable<User[]> {
        return from(this.userService.search(name));
    }

    @Post()
    @UsePipes(ValidationPipe)
    create(@Body() user: User): Observable<User> {
        return from(this.userService.create(user)).pipe(
            map((user: User) => user)
        );
    }

    @ApiBody({ type: () => UserCredentials })
    @Post('/login')
    @UsePipes(ValidationPipe)
    login(@Body() userCredendtials: UserCredentials): Observable<JwtToken | unknown> {
        return this.userService.login(userCredendtials.email, userCredendtials.password).pipe(
            map((jwt: string): JwtToken => ({ accessToken: jwt })),
            catchError(error => of({ error: error.message }))
        );
    }

    @ApiQuery({ name: 'id', type: 'string', required: true })
    @ApiBody({ type: () => UserAvatar })
    @Roles(UserRole.USER)
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Put('/avatar')
    updateAvatar(
        @Query('id', ParseUUIDPipe) id: string,
        @Body('avatar') avatar: string
    ) {
        return from(this.userService.updateAvatar(id, avatar));
    }

    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() user: User): Observable<User> {
        return from(this.userService.updateOne(id, user));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @ApiBody({ type: () => UserAvatar })
    @Roles(UserRole.USER)
    @UseGuards(JwtAuthGuard)
    @Post('/avatar')
    uploadAvatar(
        @Query('id', ParseUUIDPipe) id: string,
        @Body('avatar') avatar: string
    ): Observable<User> {
        return from(this.userService.uploadAvatar(id, avatar));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string): Observable<DeleteResult> {
        return from(this.userService.deleteOne(id));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @ApiQuery({ name: 'role', enum: UserRole })
    @Roles(UserRole.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRole(@Param('id', ParseUUIDPipe) id: string, @Query() role: UserRole): Observable<UpdateResult> {
        return from(this.userService.updateRole(id, role))
    }
}
