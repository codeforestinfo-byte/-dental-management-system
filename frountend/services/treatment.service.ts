import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { TreatmentRequest, TreatmentResponse } from '@/types/treatment.types'

export const treatmentService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<PaginatedResponse<TreatmentResponse>> {
    const res = await api.get('/api/v1/treatments', { params })
    return res.data
  },

  async getActive(): Promise<ApiResponse<TreatmentResponse[]>> {
    const res = await api.get('/api/v1/treatments/active')
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<TreatmentResponse>> {
    const res = await api.get(`/api/v1/treatments/${id}`)
    return res.data
  },

  async create(data: TreatmentRequest): Promise<ApiResponse<TreatmentResponse>> {
    const res = await api.post('/api/v1/treatments', data)
    return res.data
  },

  async update(id: number, data: TreatmentRequest): Promise<ApiResponse<TreatmentResponse>> {
    const res = await api.put(`/api/v1/treatments/${id}`, data)
    return res.data
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/api/v1/treatments/${id}`)
  },
}
