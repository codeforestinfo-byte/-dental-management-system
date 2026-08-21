import api from '@/lib/api'
import type { ApiResponse } from '@/types/common.types'
import type { LoginRequest, LoginResponse, UserResponse } from '@/types/auth.types'

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const res = await api.post('/api/v1/auth/login', data)
    return res.data
  },

  async getMe(): Promise<ApiResponse<UserResponse>> {
    const res = await api.get('/api/v1/auth/me')
    return res.data
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    const res = await api.post('/api/v1/auth/refresh', { refreshToken })
    return res.data
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout')
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post('/api/v1/auth/change-password', data)
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/api/v1/auth/forgot-password', { email })
  },
}
