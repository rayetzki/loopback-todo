import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable, of } from 'rxjs';
import { compare, hash } from 'bcrypt';
import { User } from '../user/user.interface';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    generateJWT(user: User): Observable<string> {
        return from(this.jwtService.signAsync({ user }));
    }

    hashPassword(password: string): Observable<string | unknown> {
        return from(hash(password, 10));
    }

    comparePasswords(newPassword: string, passwordHash: string): Observable<boolean | unknown> {
        return from(compare(newPassword, passwordHash)).pipe(
            map((same: boolean) => same),
            catchError((error: Error) => of({ error: error.message }))
        );
    }
}
