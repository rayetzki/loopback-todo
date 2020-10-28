import { ApiProperty } from "@nestjs/swagger";
import { Recipe } from "../recipes/recipes.interface";

export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user'
};

export class User {
    id?: string

    @ApiProperty()
    name?: string

    @ApiProperty()
    age?: number

    @ApiProperty()
    email?: string

    @ApiProperty()
    nutrition?: string

    @ApiProperty()
    password?: string

    @ApiProperty()
    avatar?: string

    @ApiProperty({ enum: [UserRole.EDITOR, UserRole.USER] })
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
