import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        AuthModule,
        CloudinaryModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule { }
