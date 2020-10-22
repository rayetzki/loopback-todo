import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './user.entity';
import { User } from './user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly authService: AuthService
    ) { }

    create(user: User): Observable<User> {
        return this.authService
            .hashPassword(user.password)
            .pipe(switchMap((passwordHash: string) => {
                return from(this.userRepository.save({
                    ...user,
                    password: passwordHash
                })).pipe(
                    map((user: User) => {
                        delete user.password;
                        return user;
                    }),
                    catchError(error => throwError(error))
                )
            }))
    }

    findAll(): Observable<User[]> {
        return from(this.userRepository.find()).pipe(
            map((users: User[]) => {
                users.forEach((user: User) => delete user.password)
                return users;
            })
        );
    }

    findOne(id: string): Observable<User> {
        return from(this.userRepository.findOne(id)).pipe(
            map((user: User) => {
                delete user.password;
                return user;
            })
        );
    }

    updateOne(id: string, user: User): Observable<UpdateResult> {
        return from(this.userRepository.update(id, user))
    }

    updateRole(id: string, user: User): Observable<UpdateResult> {
        return from(this.userRepository.update(id, user));
    }

    deleteOne(id: string): Observable<DeleteResult> {
        return from(this.userRepository.delete(id));
    }

    login(email: string, password: string): Observable<string> {
        return from(
            this.validate(email, password).pipe(switchMap((user: User) => {
                if (user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    throw new NotFoundException('User wasn\'t found');
                }
            }))
        )
    }

    validate(email: string, password: string): Observable<User> {
        return from(this.userRepository.findOne({ email })).pipe(
            switchMap((user: User) => {
                return this.authService
                    .comparePasswords(password, user.password)
                    .pipe(map((match: boolean) => {
                        if (match) {
                            delete user.password;
                            return user;
                        } else {
                            throw new BadRequestException('User doesn\'t exist');
                        }
                    }))
            })
        )
    }
}
