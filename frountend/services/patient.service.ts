import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { PatientRequest, PatientResponse } from '@/types/patient.types'

export const patientService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<ApiResponse<PaginatedResponse<PatientResponse>>> {
    const res = await api.get('/api/v1/patients', { params })
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<PatientResponse>> {
    const res = await api.get(`/api/v1/patients/${id}`)
    return res.data
  },

  async search(query: string): Promise<ApiResponse<PatientResponse[]>> {
    const res = await api.get('/api/v1/patients/search', { params: { q: query } })
    return res.data
  },

  async create(data: PatientRequest): Promise<ApiResponse<PatientResponse>> {
    const res = await api.post('/api/v1/patients', data)
    return res.data
  },

  async update(id: number, data: PatientRequest): Promise<ApiResponse<PatientResponse>> {
    const res = await api.put(`/api/v1/patients/${id}`, data)
    return res.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/patients/${id}`)
  },

  async getByBarcode(patientNumber: string): Promise<ApiResponse<PatientResponse>> {
    const res = await api.get('/api/v1/patients/barcode', { params: { number: patientNumber } })
    return res.data
  },
}
