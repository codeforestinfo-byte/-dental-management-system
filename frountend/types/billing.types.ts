export interface BillResponse {
  id: number
  billNumber: string
  appointmentId: number
  patientName: string
  dentistName: string
  treatmentName: string
  consultationFee: number
  treatmentFee: number
  totalAmount: number
  amountPaid: number
  balance: number
  billStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'
  payments: PaymentResponse[]
  createdAt: string
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
  createdAt: string
}

export interface BillListParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  status?: string
  search?: string
}

export interface AppointmentWithoutBill {
  id: number
  appointmentNumber: string
  patientName: string
  dentistName: string
  treatmentName: string
  appointmentDate: string
  appointmentTime: string
}
