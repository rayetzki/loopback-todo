import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsString, IsUrl } from "class-validator";
import { Favourite } from "../favourites/favourites.interface";
import { User } from "../user/user.interface";

export enum NutritionType {
    ANY = 'any',
    VEGAN = 'vegan',
    VEGETARIAN = 'vegetarian',
    LACTOVEGETARIAN = 'lacto',
    RAW = 'raw'
}

export enum DayTime {
    BREAKFAST = 'завтрак',
    LUNCH = 'обед',
    SUPPER = 'полудник',
    SNACK = 'перекус',
    DINNER = 'ужин'
}

export class Recipe {
    id: string
    createdAt: Date
    updatedAt: Date
    slug: string
    author: User
    favourite: Favourite

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    body: string

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                unit: { type: 'string' },
                ingredient: { type: 'string' }
            }
        }
    })
    @IsArray()
    @IsNotEmpty()
    ingredients: Array<RecipeIngredients>

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cost: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    cookingTime: string

    @ApiProperty()
    @IsUrl()
    banner: string

    @ApiProperty()
    @IsEnum(DayTime)
    dayTime: DayTime

    @ApiProperty({
        default: NutritionType.ANY,
        enum: [
            NutritionType.ANY,
            NutritionType.LACTOVEGETARIAN,
            NutritionType.RAW,
            NutritionType.VEGAN,
            NutritionType.VEGETARIAN
        ]
    })
    @IsNotEmpty()
    nutritionType: NutritionType
}

export interface PaginatedRecipes {
    recipes: Recipe[]
    page: number
    limit: number
    total: number
    perPage: number
}

export type RecipeIngredients = {
    ingredient: string
    unit: string
}

export class RecipeBanner {
    @ApiProperty({ type: 'string', format: 'binary' })
    banner: string
}

export interface DoNotEatAtNight {
    message: string
}