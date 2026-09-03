import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { DentistRequest, DentistResponse } from '@/types/dentist.types'

export const dentistService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<PaginatedResponse<DentistResponse>> {
    const res = await api.get('/api/v1/dentists', { params })
    return res.data
  },

  async getActive(): Promise<ApiResponse<DentistResponse[]>> {
    const res = await api.get('/api/v1/dentists/active')
    return res.data
  },

  async getMe(): Promise<ApiResponse<DentistResponse>> {
    const res = await api.get('/api/v1/dentists/me')
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<DentistResponse>> {
    const res = await api.get(`/api/v1/dentists/${id}`)
    return res.data
  },

  async create(data: DentistRequest, profilePhoto?: File | null, resume?: File | null): Promise<ApiResponse<DentistResponse>> {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })
    if (profilePhoto) formData.append('profilePhoto', profilePhoto)
    if (resume) formData.append('resume', resume)
    const res = await api.post('/api/v1/dentists', formData, {
      headers: { 'Content-Type': undefined },
    })
    return res.data
  },

  async update(id: number, data: DentistRequest, profilePhoto?: File | null, resume?: File | null): Promise<ApiResponse<DentistResponse>> {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })
    if (profilePhoto) formData.append('profilePhoto', profilePhoto)
    if (resume) formData.append('resume', resume)
    const res = await api.put(`/api/v1/dentists/${id}`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return res.data
  },

  async uploadProfilePhoto(id: number, file: File): Promise<ApiResponse<string>> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/api/v1/dentists/${id}/profile-photo`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return res.data
  },

  async uploadResume(id: number, file: File): Promise<ApiResponse<string>> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/api/v1/dentists/${id}/resume`, formData, {
      headers: { 'Content-Type': undefined },
    })
    return res.data
  },

  async deactivate(id: number): Promise<void> {
    await api.delete(`/api/v1/dentists/${id}`)
  },
}
