export interface UserItem {
  id: number
  username: string
  email: string
  enabled: boolean
  roles: string[]
  createdAt: string
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  roles: string[]
}

export interface UpdateUserRequest {
  email?: string
  roles?: string[]
  enabled?: boolean
}

export interface ResetPasswordRequest {
  newPassword: string
}
