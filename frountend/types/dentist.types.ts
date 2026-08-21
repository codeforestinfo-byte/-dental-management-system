export interface DentistRequest {
  dentistName: string
  specialization: string
  contactNumber: string
  email: string
}

export interface DentistResponse {
  id: number
  dentistCode: string
  dentistName: string
  specialization: string
  contactNumber: string
  email: string
  active: boolean
  createdAt: string
  updatedAt: string
}
