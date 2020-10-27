export interface Recipe {
    id?: string
    name?: string
    description?: string
    ingredients: Array<RecipeIngredients>
    cost: string
    cookingTime: string
    nutritionType: NutritionType
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