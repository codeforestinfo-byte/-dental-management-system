import api from '@/lib/api'
import type { ApiResponse } from '@/types/common.types'
import type { DailyReportResponse, RevenueReportResponse, DentistPerformanceResponse } from '@/types/report.types'

export const reportService = {
  async getDaily(date: string): Promise<ApiResponse<DailyReportResponse>> {
    const res = await api.get('/api/v1/reports/daily', { params: { date } })
    return res.data
  },

  async getWeekly(startDate: string): Promise<ApiResponse<DailyReportResponse[]>> {
    const res = await api.get('/api/v1/reports/weekly', { params: { startDate } })
    return res.data
  },

  async getMonthly(year: number, month: number): Promise<ApiResponse<DailyReportResponse[]>> {
    const res = await api.get('/api/v1/reports/monthly', { params: { year, month } })
    return res.data
  },

  async getRevenue(startDate: string, endDate: string): Promise<ApiResponse<RevenueReportResponse>> {
    const res = await api.get('/api/v1/reports/revenue', { params: { startDate, endDate } })
    return res.data
  },

  async getDentistPerformance(startDate: string, endDate: string): Promise<ApiResponse<DentistPerformanceResponse[]>> {
    const res = await api.get('/api/v1/reports/dentist-performance', { params: { startDate, endDate } })
    return res.data
  },
}
