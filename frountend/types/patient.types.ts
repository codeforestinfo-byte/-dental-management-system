export interface PatientRequest {
  firstName: string
  lastName: string
  address: string
  contactNumber: string
  email: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  medicalNotes?: string
}

export interface PatientResponse {
  id: number
  patientNumber: string
  firstName: string
  lastName: string
  address: string
  contactNumber: string
  email: string
  dateOfBirth: string
  gender: string
  medicalNotes: string
  createdAt: string
  updatedAt: string
}
