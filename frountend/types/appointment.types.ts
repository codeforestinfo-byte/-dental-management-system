export interface AppointmentRequest {
  patientId: number
  dentistId: number
  treatmentId: number
  appointmentDate: string
  appointmentTime: string
  notes?: string
}

export interface AppointmentResponse {
  id: number
  appointmentNumber: string
  patientId: number
  patientName: string
  dentistId: number
  dentistName: string
  treatmentId: number
  treatmentName: string
  appointmentDate: string
  appointmentTime: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
  createdAt: string
  updatedAt: string
}
