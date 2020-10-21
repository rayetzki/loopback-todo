export interface JwtToken {
    accessToken: string
    refreshToken?: string
    expiresIn?: string
    refreshExpiresIn?: string
};