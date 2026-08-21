import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { DentistRequest, DentistResponse } from '@/types/dentist.types'

export const dentistService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<ApiResponse<PaginatedResponse<DentistResponse>>> {
    const res = await api.get('/api/v1/dentists', { params })
    return res.data
  },

  async getActive(): Promise<ApiResponse<DentistResponse[]>> {
    const res = await api.get('/api/v1/dentists/active')
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<DentistResponse>> {
    const res = await api.get(`/api/v1/dentists/${id}`)
    return res.data
  },

  async create(data: DentistRequest): Promise<ApiResponse<DentistResponse>> {
    const res = await api.post('/api/v1/dentists', data)
    return res.data
  },

  async update(id: number, data: DentistRequest): Promise<ApiResponse<DentistResponse>> {
    const res = await api.put(`/api/v1/dentists/${id}`, data)
    return res.data
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/api/v1/dentists/${id}`)
  },
}
