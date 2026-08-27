'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { auditService } from '@/services/audit.service'
import type { AuditLogResponse } from '@/types/audit.types'
import { Loader2 } from 'lucide-react'

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await auditService.getAll({ size: 100 })
        if (res.success) setLogs(res.data || [])
      } catch { /* empty */ } finally { setLoading(false) }
    }
    fetchLogs()
  }, [])

  return (
    <DashboardLayout title="Audit Logs">
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>DATE</th><th>USER</th><th>ACTION</th><th>ENTITY</th><th>DETAILS</th><th>IP</th></tr></thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className="font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="font-medium">{log.user?.username}</td>
                      <td><span className="status-badge info">{log.action}</span></td>
                      <td>{log.entity}</td>
                      <td className="max-w-[200px] truncate text-xs text-muted-foreground">{log.details}</td>
                      <td className="font-mono text-xs">{log.ipAddress}</td>
                    </tr>
                  ))}
                  {!logs.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No audit logs found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
