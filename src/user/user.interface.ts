import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Favourite } from "../favourites/favourites.interface";
import { NutritionType, Recipe } from "../recipes/recipes.interface";

export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user'
};

export class User {
    id?: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name?: string

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    age?: number

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email?: string

    @IsString()
    refreshToken?: string;

    @ApiProperty({
        default: NutritionType.ANY,
        enum: [
            NutritionType.ANY,
            NutritionType.VEGAN,
            NutritionType.LACTOVEGETARIAN,
            NutritionType.RAW,
            NutritionType.VEGETARIAN
        ],
    })
    @IsEnum(NutritionType)
    @IsNotEmpty()
    nutrition?: NutritionType

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    avatar?: string

    @ApiProperty({ enum: [UserRole.EDITOR, UserRole.USER], default: UserRole.USER })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role?: UserRole

    recipes?: Recipe[]
    favourites?: Favourite[]
}

export interface PaginatedUsers {
    users: User[]
    page: number
    perPage: number
    total: number
}

export class UserCredentials {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsNotEmpty()
    password: string
}

export class UserAvatar {
    @ApiProperty({ type: 'string', format: 'binary' })
    avatar: string
}

export class RefreshToken {
    @ApiProperty({ type: 'string' })
    refreshToken: string
}