import api from '@/lib/api'
import type { PaginatedResponse } from '@/types/common.types'
import type { AuditLogResponse } from '@/types/audit.types'

export const auditService = {
  async getAll(params?: { page?: number; size?: number }): Promise<PaginatedResponse<AuditLogResponse>> {
    const res = await api.get('/api/v1/audit', { params })
    return res.data
  },

  async getByUserId(userId: number, params?: { page?: number; size?: number }): Promise<PaginatedResponse<AuditLogResponse>> {
    const res = await api.get(`/api/v1/audit/user/${userId}`, { params })
    return res.data
  },
}
