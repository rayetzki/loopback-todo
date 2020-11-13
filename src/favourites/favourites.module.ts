import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "src/user/user.module";
import { FavouritesController } from "./favourites.controller";
import { FavouritesEntity } from "./favourites.entity";
import { FavouritesService } from "./favourites.service";

@Module({
    imports: [TypeOrmModule.forFeature([FavouritesEntity]), UserModule],
    providers: [FavouritesService],
    controllers: [FavouritesController],
    exports: [FavouritesService]
})
export class FavouritesModule { };