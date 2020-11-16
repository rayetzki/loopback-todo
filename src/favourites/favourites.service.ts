import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { from, Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DeleteResult, Repository } from "typeorm";
import { FavouritesEntity } from "./favourites.entity";
import { Favourite } from "./favourites.interface";

@Injectable()
export class FavouritesService {
    constructor(
        @InjectRepository(FavouritesEntity) private readonly favouritesRepository: Repository<FavouritesEntity>
    ) { }

    findAll(userId: string): Observable<Favourite[]> {
        return from(this.favouritesRepository.find({
            where: { userId },
            relations: ['addedBy']
        })).pipe(
            map((favourites: Favourite[]) => favourites),
            catchError(error => throwError(error))
        );
    }

    addFavourite(favourite: Favourite): Observable<Favourite> {
        return from(this.favouritesRepository.save(favourite)).pipe(
            map((favourite: Favourite) => favourite),
            catchError(error => throwError(error))
        );
    }

    removeFavourite(favourite: Favourite): Observable<boolean> {
        return from(this.favouritesRepository.delete(favourite)).pipe(
            map((deleteResult: DeleteResult) => deleteResult.affected === 1 && true),
            catchError(error => throwError(error))
        );
    }
}