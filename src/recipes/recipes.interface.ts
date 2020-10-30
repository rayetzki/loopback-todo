import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsString } from "class-validator";
import { User } from "src/user/user.interface";

export enum NutritionType {
    ANY = 'any',
    VEGAN = 'vegan',
    VEGETARIAN = 'vegetarian',
    LACTOVEGETARIAN = 'lacto',
    RAW = 'raw'
}

export class Recipe {
    id: string
    createdAt: Date
    updatedAt: Date
    slug: string
    author: User

    @ApiProperty()
    @IsString()
    title: string

    @ApiProperty()
    @IsString()
    description: string

    @ApiProperty()
    @IsString()
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
    ingredients: Array<RecipeIngredients>

    @ApiProperty()
    @IsString()
    cost: string

    @ApiProperty()
    @IsString()
    cookingTime: string

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
    @IsEnum(NutritionType)
    nutritionType: NutritionType
}

export type RecipeIngredients = {
    ingredient: string
    unit: string
}