import api from '@/lib/api'
import type { ApiResponse, PaginatedResponse } from '@/types/common.types'
import type { BillResponse, PaymentRequest } from '@/types/billing.types'

export const billingService = {
  async getAll(params?: { page?: number; size?: number; sort?: string }): Promise<ApiResponse<PaginatedResponse<BillResponse>>> {
    const res = await api.get('/api/v1/bills', { params })
    return res.data
  },

  async getById(id: number): Promise<ApiResponse<BillResponse>> {
    const res = await api.get(`/api/v1/bills/${id}`)
    return res.data
  },

  async generateForAppointment(appointmentId: number): Promise<ApiResponse<BillResponse>> {
    const res = await api.post(`/api/v1/bills/generate/${appointmentId}`)
    return res.data
  },

  async processPayment(billId: number, data: PaymentRequest): Promise<ApiResponse<BillResponse>> {
    const res = await api.post(`/api/v1/bills/${billId}/payments`, data)
    return res.data
  },

  async downloadPdf(id: number): Promise<Blob> {
    const res = await api.get(`/api/v1/bills/pdf/${id}`, { responseType: 'blob' })
    return res.data
  },
}
