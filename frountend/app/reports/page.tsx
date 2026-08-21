'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportService } from '@/services/report.service'
import type { DailyReportResponse, DentistPerformanceResponse } from '@/types/report.types'
import { Loader2, BarChart3, TrendingUp, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

export default function ReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailyReportResponse | null>(null)
  const [weeklyReports, setWeeklyReports] = useState<DailyReportResponse[]>([])
  const [dentistPerf, setDentistPerf] = useState<DentistPerformanceResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true)
        const today = new Date().toISOString().split('T')[0]
        const [dailyRes, weeklyRes, perfRes] = await Promise.allSettled([
          reportService.getDaily(today),
          reportService.getWeekly(getWeekStart()),
          reportService.getDentistPerformance(getWeekStart(), today),
        ])
        if (dailyRes.status === 'fulfilled' && dailyRes.value.success) setDailyReport(dailyRes.value.data)
        if (weeklyRes.status === 'fulfilled' && weeklyRes.value.success) setWeeklyReports(weeklyRes.value.data || [])
        if (perfRes.status === 'fulfilled' && perfRes.value.success) setDentistPerf(perfRes.value.data || [])
      } catch { /* empty */ } finally { setLoading(false) }
    }
    fetch()
  }, [])

  return (
    <DashboardLayout title="Reports">
      {loading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {dailyReport && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Total Appointments', dailyReport.totalAppointments, BarChart3],
                ['Completed', dailyReport.completedAppointments, TrendingUp],
                ['Revenue', `LKR ${dailyReport.totalRevenue?.toLocaleString()}`, BarChart3],
                ['Avg Wait Time', `${dailyReport.averageWaitingTime} min`, Users],
              ].map(([label, value, Icon]) => (
                <Card key={label as string}><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{String(value)}</p></div><div className="icon-box"><Icon className="size-4" /></div></div></CardContent></Card>
              ))}
            </div>
          )}

          {weeklyReports.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Weekly Overview</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyReports.map((r, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], appointments: r.totalAppointments, completed: r.completedAppointments, revenue: r.totalRevenue }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {dentistPerf.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Dentist Performance</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>DENTIST</th><th>APPOINTMENTS</th><th>COMPLETED</th><th>CANCELLED</th><th>REVENUE</th></tr></thead>
                    <tbody>
                      {dentistPerf.map(d => (
                        <tr key={d.dentistId}>
                          <td className="font-medium">{d.dentistName}</td>
                          <td>{d.totalAppointments}</td>
                          <td>{d.completedAppointments}</td>
                          <td>{d.cancelledAppointments}</td>
                          <td>LKR {d.totalRevenue?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {!dailyReport && !weeklyReports.length && !dentistPerf.length && (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No report data available. Make sure the backend is running and has data.</CardContent></Card>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
