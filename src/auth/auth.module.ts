import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { RolesGuard } from './role.guard';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        forwardRef(() => UserModule),
        ConfigModule,
        JwtModule.register({})
    ],
    providers: [AuthService, RolesGuard, JwtAuthGuard, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService]
})
export class AuthModule { }
