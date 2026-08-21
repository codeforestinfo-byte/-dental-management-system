export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  username: string
  roles: string[]
}

export interface UserResponse {
  id: number
  username: string
  email: string
  enabled: boolean
  roles: string[]
  createdAt: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  roles?: string[]
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}
