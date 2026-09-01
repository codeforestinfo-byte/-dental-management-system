import api from '@/lib/api'
import type { ApiResponse } from '@/types/common.types'
import type { DentistAttendance, AttendanceRequest } from '@/types/attendance.types'

export const attendanceService = {
  async mark(data: AttendanceRequest): Promise<ApiResponse<DentistAttendance>> {
    const res = await api.post('/api/v1/dentist-attendance', data)
    return res.data
  },

  async getByDate(date: string): Promise<ApiResponse<DentistAttendance[]>> {
    const res = await api.get('/api/v1/dentist-attendance', { params: { date } })
    return res.data
  },

  async getDentistAttendance(dentistId: number, date: string): Promise<ApiResponse<DentistAttendance>> {
    const res = await api.get(`/api/v1/dentist-attendance/dentist/${dentistId}`, { params: { date } })
    return res.data
  },

  async getAttendanceMap(date: string): Promise<ApiResponse<Record<number, string>>> {
    const res = await api.get('/api/v1/dentist-attendance/map', { params: { date } })
    return res.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/v1/dentist-attendance/${id}`)
  },
}
