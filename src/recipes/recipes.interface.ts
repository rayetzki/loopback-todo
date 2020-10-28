import { ApiProperty } from "@nestjs/swagger";
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

    @ApiProperty({ type: "string" })
    title: string
    author: User

    @ApiProperty({ type: "string" })
    description: string

    @ApiProperty({ type: "string" })
    body: string

    @ApiProperty({
        type: 'array'
    })
    ingredients: Array<RecipeIngredients>

    @ApiProperty({ type: "string" })
    cost: string

    @ApiProperty({ type: "string" })
    cookingTime: string

    @ApiProperty({ enum: [NutritionType.ANY, NutritionType.LACTOVEGETARIAN, NutritionType.RAW, NutritionType.VEGAN, NutritionType.VEGETARIAN] })
    nutritionType: NutritionType
}

export type RecipeIngredients = {
    ingredient: string
    unit: string
}