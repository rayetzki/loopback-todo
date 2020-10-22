export interface User {
    id?: string
    name?: string
    age?: number
    email?: string
    nutrition?: string
    password?: string
    role?: UserRole
}

export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user'
};