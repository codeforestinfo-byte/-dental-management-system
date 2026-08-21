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
  patient: {
    id: number
    patientNumber: string
    firstName: string
    lastName: string
    contactNumber: string
  }
  dentist: {
    id: number
    dentistCode: string
    dentistName: string
    specialization: string
  }
  treatment: {
    id: number
    treatmentCode: string
    treatmentName: string
    treatmentFee: number
  }
  appointmentDate: string
  appointmentTime: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  notes: string
  createdAt: string
  updatedAt: string
}
