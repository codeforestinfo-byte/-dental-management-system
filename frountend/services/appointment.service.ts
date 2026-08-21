import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { AppointmentRequest, AppointmentResponse } from '@/types/appointment.types'

export const appointmentService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<ApiResponse<PaginatedResponse<AppointmentResponse>>> {
    const res = await api.get('/api/v1/appointments', { params })
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<AppointmentResponse>> {
    const res = await api.get(`/api/v1/appointments/${id}`)
    return res.data
  },

  async getByDate(date: string): Promise<ApiResponse<AppointmentResponse[]>> {
    const res = await api.get(`/api/v1/appointments/date/${date}`)
    return res.data
  },

  async getByDentist(dentistId: number, startDate?: string, endDate?: string): Promise<ApiResponse<AppointmentResponse[]>> {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const res = await api.get(`/api/v1/appointments/dentist/${dentistId}`, { params })
    return res.data
  },

  async getByNumber(appointmentNumber: string): Promise<ApiResponse<AppointmentResponse>> {
    const res = await api.get(`/api/v1/appointments/number/${appointmentNumber}`)
    return res.data
  },

  async create(data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> {
    const res = await api.post('/api/v1/appointments', data)
    return res.data
  },

  async update(id: number, data: AppointmentRequest): Promise<ApiResponse<AppointmentResponse>> {
    const res = await api.put(`/api/v1/appointments/${id}`, data)
    return res.data
  },

  async updateStatus(id: number, status: string): Promise<ApiResponse<AppointmentResponse>> {
    const res = await api.patch(`/api/v1/appointments/${id}/status`, null, { params: { status } })
    return res.data
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/api/v1/appointments/${id}`)
  },
}
