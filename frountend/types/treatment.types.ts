export interface TreatmentRequest {
  treatmentName: string
  description: string
  category: string
  treatmentFee: number | string
  estimatedDurationMinutes: string
}

export interface TreatmentResponse {
  id: number
  treatmentCode: string
  treatmentName: string
  description: string
  category: string
  treatmentFee: number
  estimatedDurationMinutes: number
  active: boolean
  createdAt: string
  updatedAt: string
}
