import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsInt, IsString } from "class-validator";
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
    name?: string

    @ApiProperty()
    @IsInt()
    age?: number

    @ApiProperty()
    @IsEmail()
    email?: string

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
    nutrition?: NutritionType

    @ApiProperty()
    @IsString()
    password?: string

    @ApiProperty()
    @IsString()
    avatar?: string

    @ApiProperty({ enum: [UserRole.EDITOR, UserRole.USER], default: UserRole.USER })
    @IsEnum(UserRole)
    role?: UserRole

    recipes?: Recipe[]
}

export interface PaginatedUsers {
    users: User[]
    totalItems: number
    itemCount: number
    page: number
    itemsPerPage: number
}


export class UserAvatar {
    @ApiProperty()
    @IsString()
    avatar: string
}