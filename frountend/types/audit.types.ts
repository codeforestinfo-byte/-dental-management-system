export interface AuditLogResponse {
  id: number
  user: {
    id: number
    username: string
    email: string
  }
  action: string
  entity: string
  entityId: number
  details: string
  ipAddress: string
  createdAt: string
}
