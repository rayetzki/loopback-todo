import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { compare, hash } from 'bcrypt';
import { User } from '../user/user.interface';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) { }

    generateJWT(user: User): Observable<string> {
        return from(this.jwtService.sign(user));
    }

    hashPassword(password: string): Observable<string> {
        return from(hash(password, 12));
    }

    comparePasswords(passwordHash: string, newPassword: string): Observable<boolean> {
        return from(compare(newPassword, passwordHash));
    }
}
