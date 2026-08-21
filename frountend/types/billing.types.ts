export interface BillResponse {
  id: number
  billNumber: string
  appointment: {
    id: number
    appointmentNumber: string
    appointmentDate: string
    appointmentTime: string
    patient: {
      id: number
      patientNumber: string
      firstName: string
      lastName: string
    }
    dentist: {
      id: number
      dentistName: string
    }
    treatment: {
      id: number
      treatmentName: string
    }
  }
  consultationFee: number
  treatmentFee: number
  totalAmount: number
  amountPaid: number
  balance: number
  billStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'
  payments: PaymentResponse[]
  createdAt: string
  updatedAt: string
}

export interface PaymentRequest {
  paymentMethod: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE'
  paymentAmount: number
  reference?: string
}

export interface PaymentResponse {
  id: number
  paymentMethod: string
  paymentAmount: number
  reference: string
  paymentDate: string
}
