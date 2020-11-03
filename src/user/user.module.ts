import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        AuthModule,
        CloudinaryModule,
        ConfigModule
    ],
    providers: [UserService, ConfigService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule { }
