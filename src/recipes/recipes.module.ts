import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { RecipesController } from "./recipe.controller";
import { RecipesService } from "./recipe.service";
import { RecipeEntity } from "./recipes.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([RecipeEntity]),
        UserModule
    ],
    providers: [UserService],
    controllers: [RecipesController],
    exports: [RecipesService]
})

export class RecipeModule { };