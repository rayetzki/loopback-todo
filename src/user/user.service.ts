import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './user.entity';
import { PaginatedUsers, User, UserRole } from './user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly authService: AuthService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    create(user: User): Observable<User> {
        return this.authService
            .hashPassword(user.password)
            .pipe(switchMap((passwordHash: string) => {
                return from(this.userRepository.save({
                    ...user,
                    password: passwordHash
                })).pipe(
                    map((user: User) => user),
                    catchError(error => throwError(error))
                )
            }))
    }

    findAll(limit: number, page: number): Observable<PaginatedUsers> {
        return from(this.userRepository
            .findAndCount({ skip: page, take: limit }))
            .pipe(map(([users, count]) => {
                return {
                    users,
                    totalItems: count,
                    itemCount: limit || users.length,
                    page,
                    itemsPerPage: page !== 0 ? page * limit : count
                };
            }), catchError(error => throwError(error)));
    }

    findOne(id: string): Observable<User> {
        return from(this.userRepository.findOne(id)).pipe(map((user: User) => user));
    }

    search(name: string): Observable<User[]> {
        return from(this.userRepository.find({ where: { name } })).pipe(
            map((users: User[]) => users),
            catchError(error => throwError(error))
        );
    }

    updateOne(id: string, user: User): Observable<User> {
        return from(this.userRepository.update(id, user)).pipe(
            switchMap((updateResult: UpdateResult) => {
                if (updateResult.affected === 1) {
                    return from(this.userRepository.findOne(id)).pipe(
                        map((user: User) => user),
                        catchError(error => throwError(error))
                    )
                }
            })
        )
    }

    updateRole(id: string, role: UserRole): Observable<UpdateResult> {
        return from(this.userRepository.update(id, { role }));
    }

    deleteOne(id: string): Observable<DeleteResult> {
        return from(this.userRepository.delete(id));
    }

    uploadAvatar(id: string, avatar: string): Observable<User> {
        return from(this.cloudinaryService.upload(avatar)).pipe(
            map((uploadResponse: UploadApiResponse) => {
                if (uploadResponse.created_at) {
                    this.updateOne(id, { avatar: uploadResponse.secure_url }).pipe(
                        map((user: User) => user),
                        catchError(error => throwError(error))
                    )
                } else return new BadRequestException("Sorry, couldnt add an avatar")
            }),
            catchError((error: UploadApiErrorResponse) => throwError(error))
        )
    }

    updateAvatar(id: string, avatar: string): Observable<UpdateResult> {
        return from(this.userRepository.findOne(id)).pipe(
            switchMap((user: User) => {
                if (user.avatar) {
                    return from(this.cloudinaryService.updateAvatar(user.avatar, avatar)).pipe(
                        switchMap((uploadResponse: UploadApiResponse) => {
                            return from(this.userRepository.update(id, { avatar: uploadResponse.secure_url })).pipe(
                                map((updateResult: UpdateResult) => updateResult),
                                catchError(error => throwError(error))
                            )
                        })
                    );
                } else {
                    this.uploadAvatar(id, avatar).pipe(
                        map((user: User) => user),
                        catchError(error => throwError(error))
                    );
                }
            })
        );
    }

    login(email: string, password: string): Observable<string> {
        return from(
            this.validate(email, password).pipe(switchMap((user: User) => {
                if (user) {
                    return this.authService.generateJWT(user).pipe(map((jwt: string) => jwt));
                } else {
                    throw new NotFoundException('Email or password are not correct');
                }
            }))
        )
    }

    validate(email: string, password: string): Observable<User> {
        return from(this.userRepository.findOne(
            { email },
            { select: ['password', 'age', 'avatar', 'id', 'email', 'nutrition', 'name', 'role'] }
        )).pipe(
            switchMap((user: User) => {
                return this.authService
                    .comparePasswords(password, user.password)
                    .pipe(
                        map((match: boolean) => match && user),
                        catchError(error => throwError(error))
                    )
            })
        )
    }
}
