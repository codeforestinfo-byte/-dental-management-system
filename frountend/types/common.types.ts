export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
}
