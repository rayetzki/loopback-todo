import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, iif, Observable, of } from 'rxjs';
import { compare, hash } from 'bcrypt';
import { User } from '../user/user.interface';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { JwtToken } from './auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    generateAccessRefreshPair(user: User): Observable<JwtToken> {
        const expiresIn = Number(this.configService.get('ACCESS_EXPIRES_IN').split('s')[0]);
        const refreshExpiresIn = Number(this.configService.get('REFRESH_EXPIRES_IN').split('s')[0]);

        return from(this.generateAccessToken(user)).pipe(
            switchMap((accessToken: string) => {
                return from(this.generateRefreshToken(user)).pipe(
                    map((refreshToken: string) => ({
                        accessToken,
                        expiresIn: new Date().setSeconds(new Date().getSeconds() + expiresIn),
                        refreshToken,
                        refreshExpiresIn: new Date().setSeconds(new Date().getSeconds() + refreshExpiresIn),
                        userId: user.id
                    }))
                )
            })
        );
    }

    generateAccessToken(user: User): Observable<string> {
        return from(this.jwtService.signAsync({ user }, {
            secret: this.configService.get('ACCESS_SECRET'),
            expiresIn: this.configService.get('ACCESS_EXPIRES_IN')
        }));
    }

    generateRefreshToken(user: User): Observable<string> {
        return from(this.jwtService.signAsync({ user }, {
            secret: this.configService.get('REFRESH_SECRET'),
            expiresIn: this.configService.get('REFRESH_EXPIRES_IN')
        })).pipe(map((refreshToken: string) => refreshToken));
    }

    validateAccessToken(accessToken: string): Observable<boolean | ForbiddenException> {
        const expiresIn = Number(this.configService.get('ACCESS_EXPIRES_IN'));
        return from(this.jwtService.verifyAsync(accessToken, {
            secret: this.configService.get('ACCESS_SECRET')
        })).pipe(
            switchMap((valid: boolean) => {
                return iif(
                    () => valid === true,
                    from(this.validateExpirationTime(expiresIn)),
                    of(new ForbiddenException('Token is not valid'))
                )
            })
        );
    }

    validateRefreshToken(refreshToken: string): Observable<boolean | ForbiddenException> {
        const refreshExpiresIn = Number(this.configService.get('REFRESH_EXPIRES_IN'));
        return from(this.jwtService.verifyAsync(refreshToken, {
            secret: this.configService.get('REFRESH_SECRET')
        })).pipe(
            switchMap((valid: boolean) => {
                return iif(
                    () => valid === true,
                    from(this.validateExpirationTime(refreshExpiresIn)),
                    of(new ForbiddenException('Token is not valid'))
                )
            })
        );
    }

    validateExpirationTime(expirationTime: number): Observable<boolean> {
        return of(expirationTime - new Date().getTime() > 0);
    }

    hashPassword(password: string): Observable<string | unknown> {
        return from(hash(password, 10));
    }

    comparePasswords(newPassword: string, passwordHash: string): Observable<boolean | Error> {
        return from(compare(newPassword, passwordHash)).pipe(
            map((same: boolean) => same),
            catchError((error: Error) => of(error))
        );
    }
}
