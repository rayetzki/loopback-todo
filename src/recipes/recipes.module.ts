import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { AuthService } from "src/auth/auth.service";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { RecipesController } from "./recipe.controller";
import { RecipesService } from "./recipe.service";
import { RecipeEntity } from "./recipes.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([RecipeEntity]),
        UserModule,
        AuthModule
    ],
    providers: [UserService, AuthService],
    controllers: [RecipesController],
    exports: [RecipesService]
})
export class RecipeModule { };