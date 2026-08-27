'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { appointmentService } from '@/services/appointment.service'
import { patientService } from '@/services/patient.service'
import { dentistService } from '@/services/dentist.service'
import { treatmentService } from '@/services/treatment.service'
import type { AppointmentResponse } from '@/types/appointment.types'
import type { PatientResponse } from '@/types/patient.types'
import type { DentistResponse } from '@/types/dentist.types'
import type { TreatmentResponse } from '@/types/treatment.types'
import { Plus, Loader2, Edit, X } from 'lucide-react'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([])
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [treatments, setTreatments] = useState<TreatmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAppt, setEditingAppt] = useState<AppointmentResponse | null>(null)
  const [form, setForm] = useState({ patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const fetchAll = async () => {
    try {
      setLoading(true)
      setApiError('')
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
    } catch (err: any) {
      setApiError(err?.message || 'Failed to load data')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setSubmitting(true)
    try {
      if (editingAppt) { await appointmentService.update(editingAppt.id, form) }
      else { await appointmentService.create(form) }
      setShowForm(false); setEditingAppt(null)
      setForm({ patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '' })
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

  const emptyForm = { patientId: 0, dentistId: 0, treatmentId: 0, appointmentDate: '', appointmentTime: '', notes: '' }

  return (
    <DashboardLayout title="Appointments">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => { setEditingAppt(null); setForm({ ...emptyForm }); setApiError(''); setShowForm(true) }}><Plus className="mr-2 size-4" />New Appointment</Button>
      </div>

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
              <select value={form.patientId} onChange={e => setForm({ ...form, patientId: parseInt(e.target.value) })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value={0}>Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
              <select value={form.dentistId} onChange={e => setForm({ ...form, dentistId: parseInt(e.target.value) })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
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
                <thead><tr><th>NUMBER</th><th>PATIENT</th><th>DENTIST</th><th>TREATMENT</th><th>DATE</th><th>TIME</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id}>
                      <td className="font-mono text-xs">{a.appointmentNumber}</td>
                      <td className="font-medium">{a.patientName}</td>
                      <td>{a.dentistName}</td>
                      <td>{a.treatmentName}</td>
                      <td>{a.appointmentDate}</td>
                      <td className="font-mono text-xs">{a.appointmentTime}</td>
                      <td><span className={statusColor(a.status)}>{a.status}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingAppt(a); setForm({ patientId: a.patientId, dentistId: a.dentistId, treatmentId: a.treatmentId, appointmentDate: a.appointmentDate, appointmentTime: a.appointmentTime, notes: a.notes || '' }); setShowForm(true) }} className="rounded p-1 text-muted-foreground hover:bg-accent"><Edit className="size-4" /></button>
                          {a.status === 'SCHEDULED' && <button onClick={() => handleStatusChange(a.id, 'COMPLETED')} className="rounded p-1 text-emerald-600 hover:bg-emerald-50" title="Complete">✓</button>}
                          {a.status === 'SCHEDULED' && <button onClick={() => handleStatusChange(a.id, 'CANCELLED')} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Cancel">✕</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!appointments.length && <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">No appointments found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
