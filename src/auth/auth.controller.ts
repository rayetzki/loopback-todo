import { Body, Controller, Post, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBody, ApiQuery, ApiTags } from "@nestjs/swagger";
import { from, Observable } from "rxjs";
import { RefreshToken, UserCredentials } from "src/user/user.interface";
import { UserService } from "src/user/user.service";
import { JwtToken } from "./auth.interface";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly userService: UserService) { }

    @ApiBody({ type: () => UserCredentials })
    @Post('/login')
    @UsePipes(ValidationPipe)
    login(@Body() userCredendtials: UserCredentials): Observable<JwtToken | unknown> {
        return from(this.userService.login(userCredendtials.email, userCredendtials.password));
    }

    @ApiBody({ type: () => RefreshToken })
    @ApiQuery({ name: 'id', type: 'string', description: 'Current user id' })
    @Post('/refresh')
    @UsePipes(ValidationPipe)
    refresh(
        @Body('refreshToken') refreshToken: string,
        @Query('id') id: string
    ): Observable<JwtToken | unknown> {
        return from(this.userService.refresh(id, refreshToken));
    }
}