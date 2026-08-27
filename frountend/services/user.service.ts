import api from '@/lib/api'
import type { ApiResponse } from '@/types/common.types'
import type { UserItem, CreateUserRequest, UpdateUserRequest, ResetPasswordRequest } from '@/types/user.types'

export const userService = {
  async getAll(): Promise<ApiResponse<UserItem[]>> {
    const res = await api.get('/api/v1/users')
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<UserItem>> {
    const res = await api.get(`/api/v1/users/${id}`)
    return res.data
  },

  async create(data: CreateUserRequest): Promise<ApiResponse<UserItem>> {
    const res = await api.post('/api/v1/users', data)
    return res.data
  },

  async update(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserItem>> {
    const res = await api.put(`/api/v1/users/${id}`, data)
    return res.data
  },

  async remove(id: number): Promise<ApiResponse<void>> {
    const res = await api.delete(`/api/v1/users/${id}`)
    return res.data
  },

  async resetPassword(id: number, data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    const res = await api.put(`/api/v1/users/${id}/reset-password`, data)
    return res.data
  },
}
