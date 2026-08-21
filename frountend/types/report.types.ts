export interface DailyReportResponse {
  date: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  scheduledAppointments: number
  totalRevenue: number
  averageWaitingTime: number
}

export interface RevenueReportResponse {
  startDate: string
  endDate: string
  totalRevenue: number
  totalBills: number
  averageBillAmount: number
  revenueByPaymentMethod: Record<string, number>
}

export interface DentistPerformanceResponse {
  dentistId: number
  dentistName: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  averageRating: number
}
