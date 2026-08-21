export interface TreatmentRequest {
  treatmentName: string
  description: string
  treatmentFee: number
}

export interface TreatmentResponse {
  id: number
  treatmentCode: string
  treatmentName: string
  description: string
  treatmentFee: number
  active: boolean
  createdAt: string
  updatedAt: string
}
