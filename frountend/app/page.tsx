'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Activity, AlertTriangle, Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, CreditCard, FileBarChart, HeartPulse, LayoutDashboard, Menu,
  MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus, Search, Stethoscope,
  Users, Wifi, X, CheckCircle2, UserRoundPlus, ReceiptText,
  LogOut, Loader2, User,
} from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { appointmentService } from '@/services/appointment.service'
import { reportService } from '@/services/report.service'
import { dentistService } from '@/services/dentist.service'
import type { AppointmentResponse } from '@/types/appointment.types'

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split('T')[0]
}

function formatTime(time: string) {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m} ${ampm}`
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

function SectionTitle({ icon: Icon, title, action }: { icon: typeof Activity; title: string; action?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {action && <button className="text-xs font-medium text-primary hover:underline">{action}</button>}
    </div>
  )
}

const navItems = [
  ['Dashboard', LayoutDashboard, '/'],
  ['Appointments', CalendarDays, '/appointments'],
]

const nonDentistNavItems = [
  ['Patients', Users, '/patients'],
  ['Dentists', Stethoscope, '/dentists'],
  ['Treatments', Activity, '/treatments'],
  ['Billing', CreditCard, '/billing'],
]

const bottomNavItems = [
  ['Help', CircleHelp, '/help'],
]

export default function Page() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [period, setPeriod] = useState('This week')
  const [query, setQuery] = useState('')

  const { user, loading: authLoading, logout, hasRole } = useAuth()
  const pathname = usePathname()

  const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; booked: number; completed: number; cancelled: number }[]>([])
  const [activeDentists, setActiveDentists] = useState<{ name: string; count: number; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextAppointment, setNextAppointment] = useState<AppointmentResponse | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)


  useEffect(() => {
    if (authLoading || !user) return
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const today = getToday()

        if (user?.roles?.includes('DENTIST')) {
          const [apptRes, nextRes] = await Promise.allSettled([
            appointmentService.getMyAppointmentsByDate(today),
            appointmentService.getMyNextAppointment(),
          ])

          if (apptRes.status === 'fulfilled' && apptRes.value.success) {
            setTodayAppointments(apptRes.value.data || [])
          }
          if (nextRes.status === 'fulfilled' && nextRes.value.success && nextRes.value.data) {
            setNextAppointment(nextRes.value.data)
          }
        } else {
          const [apptRes, weeklyRes, dentistsRes] = await Promise.allSettled(
            user?.roles?.includes('RECEPTIONIST')
              ? [appointmentService.getByDate(today), Promise.resolve({ success: false, data: null } as any), dentistService.getActive()]
              : [appointmentService.getByDate(today), reportService.getWeekly(getWeekStart()), dentistService.getActive()]
          )

          if (apptRes.status === 'fulfilled' && apptRes.value.success) {
            setTodayAppointments(apptRes.value.data || [])
          }

          if (weeklyRes.status === 'fulfilled' && weeklyRes.value.success) {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            const mapped = (weeklyRes.value.data || []).map((r, i) => ({
              day: days[i] || `Day${i}`,
              booked: r.totalAppointments,
              completed: r.completedAppointments,
              cancelled: r.cancelledAppointments,
            }))
            setWeeklyData(mapped)
          } else {
            setWeeklyData([
              { day: 'Mon', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Tue', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Wed', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Thu', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Fri', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Sat', booked: 0, completed: 0, cancelled: 0 },
              { day: 'Sun', booked: 0, completed: 0, cancelled: 0 },
            ])
          }

          if (dentistsRes.status === 'fulfilled' && dentistsRes.value.success) {
            const colors = ['bg-primary', 'bg-sky-500', 'bg-indigo-500', 'bg-amber-500', 'bg-rose-500']
            const mapped = (dentistsRes.value.data || []).map((d, i) => ({
              name: d.dentistName,
              count: todayAppointments.filter(a => a.dentistId === d.id).length,
              color: colors[i % colors.length],
            }))
            setActiveDentists(mapped.length > 0 ? mapped : [{ name: 'No dentists found', count: 0, color: 'bg-muted' }])
          } else {
            setActiveDentists([{ name: 'Loading...', count: 0, color: 'bg-muted' }])
          }
        }
      } catch {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, authLoading])

  useEffect(() => {
    if (!showNotifications) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-notifications]')) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showNotifications])

  const totalToday = todayAppointments.length
  const waitingCount = todayAppointments.filter(a => a.status === 'SCHEDULED').length
  const completedCount = todayAppointments.filter(a => a.status === 'COMPLETED').length

  const notifications = useMemo(() => {
    const items: { id: number; text: string; time: string; read: boolean }[] = []
    todayAppointments.forEach(a => {
      if (a.status === 'SCHEDULED') {
        items.push({ id: a.id, text: `${a.patientName || 'Patient'} has an appointment at ${formatTime(a.appointmentTime)}`, time: a.appointmentTime, read: false })
      }
      if (a.status === 'COMPLETED') {
        items.push({ id: a.id + 10000, text: `${a.patientName || 'Patient'} completed - ${a.treatmentName || 'treatment'}`, time: a.appointmentTime, read: true })
      }
      if (a.status === 'CANCELLED') {
        items.push({ id: a.id + 20000, text: `${a.patientName || 'Patient'} cancelled their appointment`, time: a.appointmentTime, read: true })
      }
    })
    return items.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 10)
  }, [todayAppointments])

  const statuses = useMemo(() => {
    const counts = { COMPLETED: 0, SCHEDULED: 0, CANCELLED: 0, NO_SHOW: 0 }
    todayAppointments.forEach(a => {
      counts[a.status as keyof typeof counts] = (counts[a.status as keyof typeof counts] || 0) + 1
    })
    return [
      { name: 'Completed', value: counts.COMPLETED, color: 'var(--chart-1)' },
      { name: 'Scheduled', value: counts.SCHEDULED, color: 'var(--chart-2)' },
      { name: 'Cancelled', value: counts.CANCELLED, color: 'var(--chart-4)' },
      { name: 'No Show', value: counts.NO_SHOW, color: 'var(--chart-3)' },
    ].filter(s => s.value > 0)
  }, [todayAppointments])

  const queue = useMemo(() => {
    return todayAppointments.slice(0, 20).map(a => ({
      time: formatTime(a.appointmentTime),
      patient: `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.trim(),
      type: a.treatment?.treatmentName || '',
      dentist: a.dentist?.dentistName || '',
      status: a.status,
      tone: a.status === 'COMPLETED' ? 'success' : a.status === 'SCHEDULED' ? 'warning' : a.status === 'CANCELLED' ? 'danger' : 'muted',
    }))
  }, [todayAppointments])

  const filteredQueue = useMemo(() => queue.filter(x => `${x.patient} ${x.type} ${x.dentist}`.toLowerCase().includes(query.toLowerCase())), [query, queue])

  const sortedSchedule = useMemo(() => {
    return todayAppointments
      .slice()
      .sort((a, b) => (a.appointmentTime || '').localeCompare(b.appointmentTime || ''))
  }, [todayAppointments])



  const dentistSchedule = useMemo(() => {
    return sortedSchedule.map(a => ({
      time: formatTime(a.appointmentTime),
      patient: a.patientName || `${a.patientId}`,
      treatment: a.treatmentName || '',
      status: a.status,
      isNext: nextAppointment?.id === a.id,
      tone: a.status === 'COMPLETED' ? 'success' : a.status === 'SCHEDULED' ? 'warning' : a.status === 'CANCELLED' ? 'danger' : 'muted',
    }))
  }, [sortedSchedule, nextAppointment])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="flex justify-center items-center px-4 pt-[18px] pb-5">
          <Image src="/sunrice-logo-2.png" alt="Sunrise Dental Logo" width={0} height={34} className="w-auto object-contain" priority />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {navItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className={`nav-item ${pathname === href ? 'active' : ''}`} title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
          {!hasRole('DENTIST') && nonDentistNavItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className={`nav-item ${pathname === href ? 'active' : ''}`} title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
          {!hasRole('RECEPTIONIST') && !hasRole('DENTIST') && (
            <Link href="/reports" className={`nav-item ${pathname === '/reports' ? 'active' : ''}`} title={collapsed ? 'Reports' : undefined}>
              <FileBarChart className="size-[18px]" /><span>{!collapsed && 'Reports'}</span>
            </Link>
          )}
          <div className="my-4 border-t border-border" />
          {bottomNavItems.map(([label, Icon, href]) => (
            <Link key={label as string} href={href as string} className="nav-item" title={collapsed ? label as string : undefined}>
              <Icon className="size-[18px]" /><span>{!collapsed && label as string}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <div className="avatar">{user?.username?.slice(0, 2).toUpperCase() || 'U'}</div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.username || 'User'}</p>
                <p className="text-[11px] text-muted-foreground">{user?.roles?.[0] || 'Staff'}</p>
              </div>
            )}
            <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="Logout">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className={`main-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden" onClick={() => setMobileOpen(true)}><Menu className="size-5" /></button>
          <button className="hidden rounded-md p-2 text-muted-foreground hover:bg-accent md:block" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}</button>
          <div className="hidden items-center gap-5 ml-auto sm:flex">
            <div className="text-right"><p className="text-xs font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p><p className="mt-1 text-[11px] text-muted-foreground">Colombo, Sri Lanka</p></div>
            <div className="relative" data-notifications>
              <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="size-[18px]" />
                {notifications.some(n => !n.read) && <span className="notification-dot" />}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-background shadow-lg z-50">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2">
                    <p className="text-xs font-semibold">Notifications</p>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-muted-foreground">No notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`border-b border-border px-4 py-2.5 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                        <p className="text-xs leading-relaxed">{n.text}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{formatTime(n.time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="avatar small">{user?.username?.slice(0, 2).toUpperCase() || 'U'}</div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.username || 'User'}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{hasRole('DENTIST') ? 'Here\'s your schedule for today.' : 'Here\'s what\'s happening at Sunrise Dental Clinic today.'}</p>
            </div>
            {!hasRole('DENTIST') && (
              <div className="flex flex-wrap gap-2">
                <Link href="/patients"><Button variant="outline" size="sm"><UserRoundPlus data-icon="inline-start" />Register patient</Button></Link>
                <Link href="/appointments"><Button size="sm"><Plus data-icon="inline-start" />New appointment</Button></Link>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          )}

          {/* ===== DENTIST DASHBOARD ===== */}
          {hasRole('DENTIST') ? (
            <>
              {/* Next Patient */}
              <Card className={`mb-6 ${nextAppointment ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock3 className="size-5 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Next Patient</h3>
                    </div>
                    {nextAppointment ? (
                      <div>
                        <p className="text-lg font-bold text-foreground">{nextAppointment.patientName || 'Patient'}</p>
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Time:</span> {formatTime(nextAppointment.appointmentTime)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Treatment:</span> {nextAppointment.treatmentName || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Appointment:</span> {nextAppointment.appointmentNumber}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                        <p className="text-sm font-medium text-foreground">No more patients today</p>
                        <p className="text-xs text-muted-foreground">All appointments completed</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

              {/* Stats */}
              <div className="grid gap-3 sm:grid-cols-3 mb-6">
                {[
                  ["Today's appointments", totalToday.toString(), CalendarDays, 'text-blue-600'],
                  ['Completed', completedCount.toString(), CheckCircle2, 'text-emerald-600'],
                  ['Remaining', (totalToday - completedCount).toString(), Clock3, 'text-amber-600'],
                ].map(([label, value, Icon, colorClass]) => (
                  <Card key={label as string} className="metric-card"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{label as string}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value as string}</p></div><div className={`icon-box ${colorClass}`}><Icon className="size-4" /></div></div></CardContent></Card>
                ))}
              </div>

              {/* Today's Schedule */}
              <Card className="mb-6">
                <CardHeader><SectionTitle icon={CalendarDays} title="Today's schedule" /></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>TIME</th><th>PATIENT</th><th>TREATMENT</th><th>STATUS</th></tr></thead>
                      <tbody>
                        {dentistSchedule.map((x, i) => (
                          <tr key={i} className={x.isNext ? 'bg-primary/5 border-l-2 border-l-primary' : ''}>
                            <td className="font-mono text-xs text-muted-foreground">{x.time}</td>
                            <td className="font-medium">
                              {x.patient}
                              {x.isNext && <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">NEXT</span>}
                            </td>
                            <td>{x.treatment}</td>
                            <td><StatusBadge tone={x.tone}>{x.status}</StatusBadge></td>
                          </tr>
                        ))}
                        {!dentistSchedule.length && <tr><td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">No appointments scheduled for today.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Status Pie */}
              {statuses.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Appointment status</CardTitle></CardHeader>
                  <CardContent className="flex items-center gap-6">
                    <ChartContainer config={{ completed: { label: 'Completed', color: 'var(--chart-1)' } }} className="h-[170px] w-[170px]">
                      <ResponsiveContainer><PieChart><Pie data={statuses} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0}>{statuses.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                    </ChartContainer>
                    <div className="flex flex-1 flex-col gap-2.5">
                      {statuses.map(s => (
                        <div key={s.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} /><span>{s.name}</span></div>
                          <span className="font-semibold">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
          /* ===== ADMIN / RECEPTIONIST DASHBOARD ===== */
          <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Today's appointments", totalToday.toString(), `${todayAppointments.length > 0 ? 'Active today' : 'No appointments'}`, CalendarDays],
              ['Waiting patients', waitingCount.toString(), `${waitingCount > 0 ? waitingCount + ' require attention' : 'None waiting'}`, Clock3],
              ['Completed today', completedCount.toString(), totalToday > 0 ? `${Math.round((completedCount / totalToday) * 100)}% of appointments` : '0% of appointments', CheckCircle2],
              ['Pending payments', 'LKR 0', 'Outstanding bills', ReceiptText],
            ].map(([label, value, meta, Icon]) => (
              <Card key={label as string} className="metric-card"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground" dangerouslySetInnerHTML={{ __html: label as string }} /><p className="mt-2 text-2xl font-bold tracking-tight">{value as string}</p><p className="mt-1 text-[11px] text-muted-foreground">{meta as string}</p></div><div className="icon-box"><Icon className="size-4" /></div></div></CardContent></Card>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
            <Card>
              <CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm">Appointment volume</CardTitle><select value={period} onChange={e => setPeriod(e.target.value)} className="select-control"><option>This week</option><option>This month</option><option>Today</option></select></CardHeader>
              <CardContent>
                <ChartContainer config={{ booked: { label: 'Booked', color: 'var(--chart-1)' }, completed: { label: 'Completed', color: 'var(--chart-2)' } }} className="h-[230px] w-full">
                  <ResponsiveContainer><AreaChart data={weeklyData}><defs><linearGradient id="bookedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-booked)" stopOpacity={.25} /><stop offset="100%" stopColor="var(--color-booked)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} /><Tooltip content={<ChartTooltipContent />} /><Area type="monotone" dataKey="booked" stroke="var(--color-booked)" fill="url(#bookedFill)" strokeWidth={2} /><Area type="monotone" dataKey="completed" stroke="var(--color-completed)" fill="none" strokeWidth={2} /></AreaChart></ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
                  <span><i className="legend-dot bg-primary" />Booked</span>
                  <span><i className="legend-dot bg-sky-500" />Completed</span>
                  <span><i className="legend-dot bg-destructive" />Cancelled</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Appointment status</CardTitle></CardHeader>
              <CardContent className="flex items-center gap-6">
                <ChartContainer config={{ completed: { label: 'Completed', color: 'var(--chart-1)' } }} className="h-[170px] w-[170px]">
                  <ResponsiveContainer><PieChart><Pie data={statuses} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} strokeWidth={0}>{statuses.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-1 flex-col gap-2.5">
                  {statuses.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} /><span>{s.name}</span></div>
                      <span className="font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader><SectionTitle icon={CalendarDays} title="Today's appointment queue" action="View all appointments" /></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>TIME</th><th>PATIENT</th><th>TREATMENT</th><th>DENTIST</th><th>STATUS</th><th /></tr></thead>
                    <tbody>
                      {filteredQueue.map((x, i) => (
                        <tr key={i}>
                          <td className="font-mono text-xs text-muted-foreground">{x.time}</td>
                          <td className="font-medium">{x.patient}</td>
                          <td>{x.type}</td>
                          <td>{x.dentist}</td>
                          <td><StatusBadge tone={x.tone}>{x.status}</StatusBadge></td>
                          <td><button className="text-muted-foreground"><MoreHorizontal className="size-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredQueue.length && <div className="p-8 text-center text-sm text-muted-foreground">No appointments match your search.</div>}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><SectionTitle icon={Stethoscope} title="Dentist workload" action="View schedule" /></CardHeader>
              <CardContent className="flex flex-col gap-5">
                {activeDentists.map((d, i) => (
                  <div key={d.name}>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-medium">{d.name}</span>
                      <span className="text-muted-foreground">{d.count} appointments</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.count > 0 ? Math.min((d.count / (totalToday || 1)) * 100, 100) : 0}%` }} />
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" />All dentists are currently available
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader><SectionTitle icon={Clock3} title="Patient waiting time" /></CardHeader>
              <CardContent>
                <div className="mb-3 flex items-end gap-2"><span className="text-3xl font-bold">12</span><span className="mb-1 text-xs text-muted-foreground">min average today</span></div>
                <ChartContainer config={{ value: { label: 'Patients', color: 'var(--chart-2)' } }} className="h-[130px] w-full">
                  <ResponsiveContainer><BarChart data={[{ range: '0–10', value: 18 }, { range: '11–20', value: 12 }, { range: '21–30', value: 6 }, { range: '31+', value: 2 }]}><XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} /><YAxis hide /><Tooltip content={<ChartTooltipContent hideLabel />} /><Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><SectionTitle icon={AlertTriangle} title="Alerts & exceptions" action="View all" /></CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  [`${waitingCount} patients waiting`, 'Queue attention needed', 'warning'],
                  ['Appointments need confirmation', 'Check schedule', 'info'],
                  ['System health check', 'All systems operational', 'success'],
                ].map(([a, b, t]) => (
                  <div key={a as string} className="flex gap-3">
                    <div className={`alert-icon ${t}`}><AlertTriangle className="size-3.5" /></div>
                    <div><p className="text-xs font-medium">{a}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{b}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><SectionTitle icon={Activity} title="System status" /></CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Cloud database</span><StatusBadge tone="success">Operational</StatusBadge></div>
                <div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Last synchronized</span><span className="text-xs font-medium">Just now</span></div>
                <div className="rounded-lg bg-primary/10 px-3 py-2.5"><p className="text-xs font-semibold text-primary">All systems running smoothly</p><p className="mt-1 text-[11px] text-muted-foreground">Next scheduled check: 30 min</p></div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  )
}

void ChevronDown; void ChevronLeft; void ChevronRight; void MoreHorizontal
