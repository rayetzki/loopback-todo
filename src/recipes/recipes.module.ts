import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { RecipesController } from "./recipes.controller";
import { RecipesService } from "./recipes.service";
import { RecipeEntity } from "./recipes.entity";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";
import { FavouritesModule } from "src/favourites/favourites.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([RecipeEntity]),
        forwardRef(() => FavouritesModule),
        UserModule,
        AuthModule,
        CloudinaryModule
    ],
    providers: [RecipesService],
    controllers: [RecipesController],
    exports: [RecipesService]
})
export class RecipeModule { };