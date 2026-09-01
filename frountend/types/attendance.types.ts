export interface DentistAttendance {
  id: number
  dentist: { id: number; dentistName: string; specialization: string; department: string }
  attendanceDate: string
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY'
  notes: string | null
  createdAt: string
}

export interface AttendanceRequest {
  dentistId: number
  attendanceDate: string
  status: string
  notes?: string
}
