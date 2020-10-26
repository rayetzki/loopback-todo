export interface User {
    id?: string
    name?: string
    age?: number
    email?: string
    nutrition?: string
    password?: string
    role?: UserRole
}

export interface PaginatedUsers {
    users: User[]
    offset?: number
    limit?: number
    count?: number
}

export enum UserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user'
};