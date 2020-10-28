import { User } from "src/user/user.interface";

export interface Recipe {
    id: string
    createdAt: Date
    updatedAt: Date
    title: string
    slug: string
    description: string
    body: string
    ingredients: Array<RecipeIngredients>
    cost: string
    cookingTime: string
    nutritionType: NutritionType
    author: User
}

export interface RecipeIngredients {
    ingredient: string
    unit: string
}

export enum NutritionType {
    ANY = 'any',
    VEGAN = 'vegan',
    VEGETARIAN = 'vegetarian',
    LACTOVEGETARIAN = 'lacto',
    RAW = 'raw'
}