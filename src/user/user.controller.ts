// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginatedUsers, User, UserRole, UserCredentials, UserAvatar } from './user.interface';
import { UserService } from './user.service';
import { JwtToken } from '../auth/auth.interface';
import { Roles } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/role.guard';
import { IsUserGuard, JwtAuthGuard } from '../auth/auth.guard';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) { }

    @ApiQuery({ name: 'limit', type: 'number', required: false })
    @ApiQuery({ name: 'page', type: 'number', required: false })
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get()
    findAll(
        @Query('limit') limit = 0,
        @Query('page') page = 0
    ): Observable<PaginatedUsers | User> {
        return from(this.userService.findAll(limit, page));
    }

    @ApiParam({ name: 'id', type: 'string', required: false })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Observable<User> {
        return from(this.userService.findOne(id));
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
        return this.userService.login(userCredendtials.email, userCredendtials.password);
    }

    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() user: User): Observable<User> {
        return from(this.userService.updateOne(id, user));
    }

    @ApiQuery({ name: 'id', type: 'string', required: true })
    @ApiBody({ description: 'User avatar', type: UserAvatar })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('avatar'))
    @Roles(UserRole.USER)
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Post('/avatar')
    uploadAvatar(
        @Query('id') id: string,
        @UploadedFile() file
    ): Observable<User> {
        return from(this.userService.uploadAvatar(id, file));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Delete(':id')
    delete(@Param('id') id: string): Observable<DeleteResult> {
        return from(this.userService.deleteOne(id));
    }

    @ApiParam({ name: 'id', type: 'string', required: true })
    @ApiQuery({ name: 'role', enum: UserRole })
    @Roles(UserRole.USER)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRole(@Param('id') id: string, @Query() role: UserRole): Observable<UpdateResult> {
        return from(this.userService.updateRole(id, role))
    }
}
