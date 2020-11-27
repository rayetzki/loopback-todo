import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { DeleteResult, getRepository, Repository, UpdateResult } from 'typeorm';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginatedUsers, User, UserRole } from './user.interface';
import { AuthService } from '../auth/auth.service';
import { UserEntity } from './user.entity';
import { JwtToken } from 'src/auth/auth.interface';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
        private readonly authService: AuthService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    create(user: User): Observable<User> {
        if (user.role === UserRole.ADMIN) {
            throw new ForbiddenException("Ты не можешь стать админом");
        } else {
            return from(
                this.userRepository.findOne({ email: user.email })
            ).pipe(
                switchMap((foundUser: User) => {
                    if (
                        foundUser && foundUser.name === user.name ||
                        foundUser && foundUser.email === user.email
                    ) {
                        throw new BadRequestException("User with such email or name already exist")
                    } else if (!foundUser) {
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
                })
            )
        }
    }

    findAll(limit: number, page: number): Observable<PaginatedUsers> {
        return from(this.userRepository.findAndCount({
            skip: page,
            take: limit
        })).pipe(
            map(([users, count]) => ({
                users,
                total: count,
                page,
                perPage: page !== 0 ? page * limit : count
            })),
            catchError(error => throwError(error))
        );
    }

    findOne(id: string): Observable<User> {
        return from(this.userRepository.findOne(id)).pipe(map((user: User) => user));
    }

    search(name: string): Observable<User[]> {
        return from(getRepository(UserEntity)
            .createQueryBuilder('user')
            .where("user.name like :name", { name: `%${name}%` })
            .getMany()
        ).pipe(
            map((users: User[]) => users),
            catchError(error => throwError(error))
        );
    }

    updateOne(id: string, user: User): Observable<User> {
        return from(this.userRepository.findOne(id)).pipe(
            switchMap((foundUser: User) => {
                if (foundUser.role !== UserRole.ADMIN && user.role === UserRole.ADMIN) {
                    throw new ForbiddenException("Ты не можешь стать админом");
                } else {
                    return from(this.userRepository.update(id, user)).pipe(
                        switchMap((updateResult: UpdateResult) => {
                            if (updateResult.affected === 1) {
                                return from(this.findOne(id)).pipe(
                                    map((user: User) => user),
                                    catchError(error => throwError(error))
                                )
                            }
                        })
                    );
                };
            })
        )
    }

    updateRole(id: string, role: UserRole): Observable<UpdateResult> {
        return from(this.userRepository.update(id, { role }));
    }

    deleteOne(id: string): Observable<DeleteResult> {
        return from(this.userRepository.delete(id));
    }

    async uploadAvatar(id: string, file): Promise<User> {
        try {
            const uploadResponse: UploadApiResponse | UploadApiErrorResponse = await this.cloudinaryService.uploadStream('avatars', file);
            if (uploadResponse) {
                const updateResult: UpdateResult = await this.userRepository.update(id, { avatar: uploadResponse.secure_url });
                if (updateResult.affected === 1) {
                    const user: User = await this.userRepository.findOne(id);
                    return user;
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    login(email: string, password: string): Observable<JwtToken | unknown> {
        return from(
            this.validate(email, password).pipe(
                switchMap((user: User) => {
                    return from(this.authService.generateAccessRefreshPair(user)).pipe(
                        map((jwtToken: JwtToken) => jwtToken)
                    )
                })
            )
        );
    }

    validate(email: string, password: string): Observable<User> {
        return from(this.userRepository.findOne(
            { email },
            { select: ['password', 'age', 'avatar', 'id', 'email', 'nutrition', 'name', 'role'] }
        )).pipe(
            switchMap((user: User) =>
                this.authService.comparePasswords(password, user.password).pipe(
                    map((match: boolean) => {
                        if (!match) throw new BadRequestException('Пароль не подходит');
                        return user;
                    }),
                    catchError(error => throwError(error))
                )
            )
        );
    }

    refresh(id: string, refreshToken: string): Observable<JwtToken | unknown> {
        return from(this.userRepository.findOneOrFail(id)).pipe(
            switchMap((user: User) => {
                return from(this.authService.validateRefreshToken(refreshToken)).pipe(
                    switchMap(() => {
                        return from(this.authService.generateAccessRefreshPair(user)).pipe(
                            map((jwtToken: JwtToken) => jwtToken)
                        )
                    })
                )
            })
        )
    }
}