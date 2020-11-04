export interface JwtToken {
    accessToken: string
    expiresIn: number
    refreshToken?: string
    refreshExpiresIn?: string
    userId?: string
};