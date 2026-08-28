export interface DentistRequest {
  dentistName: string
  gender: string
  dateOfBirth: string
  nicNumber: string
  slmcRegistrationNumber: string
  specialization: string
  qualification: string
  yearsOfExperience: string
  licenseExpiryDate: string
  contactNumber: string
  secondaryPhone: string
  email: string
  address: string
  joiningDate: string
  employmentType: string
  department: string
  consultationFee: string
  followupFee: string
  status: string
  availableDays: string
}

export interface DentistResponse {
  id: number
  dentistCode: string
  dentistName: string
  gender: string
  dateOfBirth: string
  profilePhotoUrl: string
  nicNumber: string
  slmcRegistrationNumber: string
  specialization: string
  qualification: string
  yearsOfExperience: number
  licenseExpiryDate: string
  contactNumber: string
  secondaryPhone: string
  email: string
  address: string
  joiningDate: string
  employmentType: string
  department: string
  consultationFee: number
  followupFee: number
  status: string
  availableDays: string
  resumeUrl: string
  active: boolean
  createdAt: string
  updatedAt: string
}
