import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { from, Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { PaginatedUsers, User, UserRole, UserAvatar } from './user.interface';
import { UserService } from './user.service';
import { Roles } from '../auth/auth.decorator';
import { RolesGuard } from '../auth/role.guard';
import { IsUserGuard, JwtAuthGuard } from '../auth/auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

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

    @ApiQuery({ name: 'name', type: 'string', required: true })
    @UseGuards(JwtAuthGuard)
    @Get('/search')
    search(@Query('name') name: string): Observable<User[]> {
        return from(this.userService.search(name));
    }

    @ApiParam({ name: 'id', type: 'string', required: false })
    @UseGuards(JwtAuthGuard, IsUserGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Observable<User> {
        return from(this.userService.findOne(id));
    }

    @Post()
    @UsePipes(ValidationPipe)
    create(@Body() user: User): Observable<User> {
        return from(this.userService.create(user));
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
    async uploadAvatar(
        @Query('id') id: string,
        @UploadedFile() file
    ): Promise<User> {
        return this.userService.uploadAvatar(id, file);
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
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Put(':id/role')
    updateRole(@Param('id') id: string, @Query() role: UserRole): Observable<UpdateResult> {
        return from(this.userService.updateRole(id, role))
    }
}
