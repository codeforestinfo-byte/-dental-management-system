'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { appointmentService } from '@/services/appointment.service'
import { patientService } from '@/services/patient.service'
import { dentistService } from '@/services/dentist.service'
import { treatmentService } from '@/services/treatment.service'
import { useAuth } from '@/contexts/AuthContext'
import type { AppointmentResponse } from '@/types/appointment.types'
import type { PatientResponse } from '@/types/patient.types'
import type { DentistResponse } from '@/types/dentist.types'
import type { TreatmentResponse } from '@/types/treatment.types'
import { Plus, Loader2, Edit, X, ScanBarcode, CalendarDays, Clock3, CheckCircle2, XCircle } from 'lucide-react'

export default function AppointmentsPage() {
  const { user, hasRole } = useAuth()
  const isDentist = hasRole('DENTIST')
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [treatments, setTreatments] = useState<TreatmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAppt, setEditingAppt] = useState<AppointmentResponse | null>(null)
  const [form, setForm] = useState({ patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '', patientAddress: '', patientContact: '' })
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [barcodeScan, setBarcodeScan] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true)
      setApiError('')

      if (isDentist) {
        const [apptRes, patRes, treatRes] = await Promise.allSettled([
          appointmentService.getMyAppointments({ size: 100, sortBy: 'appointmentDate', sortDir: 'desc' }),
          patientService.getAll({ size: 100 }),
          treatmentService.getActive(),
        ])
        if (apptRes.status === 'fulfilled' && apptRes.value.success) setAppointments(apptRes.value.data || [])
        if (patRes.status === 'fulfilled' && patRes.value.success) setPatients(patRes.value.data || [])
        if (treatRes.status === 'fulfilled' && treatRes.value.success) setTreatments(treatRes.value.data || [])
      } else {
        const [apptRes, patRes, denRes, treatRes] = await Promise.allSettled([
          appointmentService.getAll({ size: 100 }),
          patientService.getAll({ size: 100 }),
          dentistService.getActive(),
          treatmentService.getActive(),
        ])
        if (apptRes.status === 'fulfilled' && apptRes.value.success) setAppointments(apptRes.value.data || [])
        if (patRes.status === 'fulfilled' && patRes.value.success) setPatients(patRes.value.data || [])
        if (denRes.status === 'fulfilled' && denRes.value.success) setDentists(denRes.value.data || [])
        if (treatRes.status === 'fulfilled' && treatRes.value.success) setTreatments(treatRes.value.data || [])
      }
    } catch (err: any) {
      setApiError(err?.message || 'Failed to load data')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleBarcodeScan = async () => {
    const code = barcodeScan.trim()
    if (!code) return
    setScanning(true)
    setScanMessage('')
    try {
      const res = await patientService.getByBarcode(code)
      if (res.success && res.data) {
        const p = res.data
        setForm({ ...form, patientId: p.id, patientAddress: p.address || '', patientContact: p.contactNumber || '' })
        setScanMessage(`Patient found: ${p.firstName} ${p.lastName} (${p.patientNumber})`)
        setBarcodeScan('')
      } else {
        setScanMessage(res.message || 'Patient not found. Try again or select manually.')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Patient not found. Try again or select manually.'
      setScanMessage(msg)
    } finally { setScanning(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setSubmitting(true)
    try {
      if (editingAppt) { await appointmentService.update(editingAppt.id, form) }
      else { await appointmentService.create(form) }
      setShowForm(false); setEditingAppt(null)
      setForm({ patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '', patientAddress: '', patientContact: '' })
      fetchAll()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save appointment.'
      setApiError(msg)
    } finally { setSubmitting(false) }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try { await appointmentService.updateStatus(id, status); fetchAll() } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update status.'
      setApiError(msg)
    }
  }

  const statusColor = (s: string) => {
    if (s === 'COMPLETED') return 'status-badge success'
    if (s === 'SCHEDULED') return 'status-badge warning'
    if (s === 'CANCELLED') return 'status-badge danger'
    return 'status-badge muted'
  }

  const emptyForm = { patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '', patientAddress: '', patientContact: '' }

  return (
    <DashboardLayout title="Appointments">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          ['Total Appointments', appointments.length.toString(), appointments.length > 0 ? `${appointments.length} booked` : 'No appointments', CalendarDays, 'text-blue-600'],
          ['Scheduled', appointments.filter(a => a.status === 'SCHEDULED').length.toString(), 'Upcoming appointments', Clock3, 'text-amber-600'],
          ['Completed', appointments.filter(a => a.status === 'COMPLETED').length.toString(), 'Finished appointments', CheckCircle2, 'text-emerald-600'],
          ['Cancelled', appointments.filter(a => a.status === 'CANCELLED').length.toString(), 'Cancelled appointments', XCircle, 'text-red-600'],
        ].map(([label, value, meta, Icon, colorClass]) => (
          <Card key={label as string} className="metric-card"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{label as string}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value as string}</p><p className="mt-1 text-[11px] text-muted-foreground">{meta as string}</p></div><div className={`icon-box ${colorClass}`}><Icon className="size-4" /></div></div></CardContent></Card>
        ))}
      </div>
      {!isDentist && (
        <div className="mb-6 mt-6 flex justify-end">
          <Button onClick={() => {
            setEditingAppt(null)
            setForm({
              ...emptyForm,
              ...(isDentist && user?.dentistId ? { dentistId: user.dentistId } : {}),
            })
            setApiError('')
            setShowForm(true)
          }}><Plus className="mr-2 size-4" />New Appointment</Button>
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm">{editingAppt ? 'Edit Appointment' : 'New Appointment'}</CardTitle><button onClick={() => { setShowForm(false); setEditingAppt(null) }}><X className="size-4" /></button></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Patient</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ScanBarcode className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={barcodeScan}
                      onChange={e => setBarcodeScan(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleBarcodeScan() } }}
                      placeholder="Scan barcode or type patient number..."
                      className="flex h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={handleBarcodeScan} disabled={scanning || !barcodeScan.trim()} className="shrink-0">
                    {scanning ? <Loader2 className="size-4 animate-spin" /> : <ScanBarcode className="size-4" />}
                  </Button>
                </div>
                {scanMessage && (
                  <p className={`text-xs mt-1 ${scanMessage.includes('found:') ? 'text-green-600' : 'text-destructive'}`}>{scanMessage}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground mb-1 block">Or Select Patient Manually</label>
                <select value={form.patientId} onChange={e => {
                  const pid = parseInt(e.target.value)
                  const selected = patients.find(p => p.id === pid)
                  setForm({ ...form, patientId: pid, patientAddress: selected?.address || '', patientContact: selected?.contactNumber || '' })
                  setScanMessage('')
                }} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary w-full">
                  <option value={0}>Select Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.patientNumber})</option>)}
                </select>
              </div>
              <input type="text" value={form.patientAddress} onChange={e => setForm({ ...form, patientAddress: e.target.value })} placeholder="Patient Address" className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input type="text" value={form.patientContact} onChange={e => setForm({ ...form, patientContact: e.target.value })} placeholder="Contact Number" className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <select value={form.dentistId} onChange={e => setForm({ ...form, dentistId: parseInt(e.target.value) })} required disabled={isDentist} className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed">
                <option value={0}>Select Dentist</option>
                {dentists.map(d => <option key={d.id} value={d.id}>{d.dentistName}</option>)}
              </select>
              <select value={form.treatmentId} onChange={e => setForm({ ...form, treatmentId: parseInt(e.target.value) })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value={0}>Select Treatment</option>
                {treatments.map(t => <option key={t.id} value={t.id}>{t.treatmentName}</option>)}
              </select>
              <input type="date" value={form.appointmentDate} onChange={e => setForm({ ...form, appointmentDate: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input type="time" value={form.appointmentTime} onChange={e => setForm({ ...form, appointmentTime: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="flex min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingAppt(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingAppt ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>NUMBER</th><th>PATIENT</th><th>ADDRESS</th><th>CONTACT</th><th>DENTIST</th><th>TREATMENT</th><th>DATE</th><th>TIME</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-xs">{a.appointmentNumber}</td>
                      <td className="font-medium">{a.patientName}</td>
                      <td className="text-xs">{a.patientAddress}</td>
                      <td className="text-xs">{a.patientContact}</td>
                      <td>{a.dentistName}</td>
                      <td>{a.treatmentName}</td>
                      <td>{a.appointmentDate}</td>
                      <td className="font-mono text-xs">{a.appointmentTime}</td>
                      <td><span className={statusColor(a.status)}>{a.status}</span></td>
                      <td>
                        <div className="flex gap-1">
                          {!isDentist && (
                            <button onClick={() => { setEditingAppt(a); setForm({ patientId: a.patientId, dentistId: a.dentistId, treatmentId: a.treatmentId, appointmentDate: a.appointmentDate, appointmentTime: a.appointmentTime, notes: a.notes || '', patientAddress: a.patientAddress || '', patientContact: a.patientContact || '' }); setShowForm(true) }} className="rounded p-1 text-muted-foreground hover:bg-accent"><Edit className="size-4" /></button>
                          )}
                          {a.status === 'SCHEDULED' && <button onClick={() => handleStatusChange(a.id, 'COMPLETED')} className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="Complete">✓</button>}
                          {!isDentist && a.status === 'SCHEDULED' && <button onClick={() => handleStatusChange(a.id, 'CANCELLED')} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Cancel">✕</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!appointments.length && <tr><td colSpan={10} className="p-8 text-center text-sm text-muted-foreground">No appointments found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
