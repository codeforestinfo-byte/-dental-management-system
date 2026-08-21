'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { patientService } from '@/services/patient.service'
import type { PatientResponse } from '@/types/patient.types'
import { Plus, Search, Loader2, Edit, Trash2, X } from 'lucide-react'

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', address: '', contactNumber: '', email: '', dateOfBirth: '', gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER', medicalNotes: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      if (searchQuery) {
        const res = await patientService.search(searchQuery)
        if (res.success) setPatients(res.data || [])
      } else {
        const res = await patientService.getAll({ size: 100 })
        if (res.success) setPatients(res.data?.content || [])
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchPatients() }, [searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, form)
      } else {
        await patientService.create(form)
      }
      setShowForm(false)
      setEditingPatient(null)
      setForm({ firstName: '', lastName: '', address: '', contactNumber: '', email: '', dateOfBirth: '', gender: 'MALE', medicalNotes: '' })
      fetchPatients()
    } catch { /* empty */ } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    try { await patientService.delete(id); fetchPatients() } catch { /* empty */ }
  }

  const startEdit = (p: PatientResponse) => {
    setEditingPatient(p)
    setForm({ firstName: p.firstName, lastName: p.lastName, address: p.address, contactNumber: p.contactNumber, email: p.email, dateOfBirth: p.dateOfBirth, gender: p.gender as 'MALE' | 'FEMALE' | 'OTHER', medicalNotes: p.medicalNotes || '' })
    setShowForm(true)
  }

  return (
    <DashboardLayout title="Patients">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patients..." className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <Button onClick={() => { setEditingPatient(null); setForm({ firstName: '', lastName: '', address: '', contactNumber: '', email: '', dateOfBirth: '', gender: 'MALE', medicalNotes: '' }); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Patient</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">{editingPatient ? 'Edit Patient' : 'New Patient'}</CardTitle>
            <button onClick={() => { setShowForm(false); setEditingPatient(null) }} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Contact Number" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })} className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
              <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2" />
              <textarea placeholder="Medical Notes" value={form.medicalNotes} onChange={e => setForm({ ...form, medicalNotes: e.target.value })} className="flex min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPatient(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingPatient ? 'Update' : 'Create'}</Button>
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
                <thead><tr><th>NUMBER</th><th>NAME</th><th>CONTACT</th><th>EMAIL</th><th>GENDER</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs">{p.patientNumber}</td>
                      <td className="font-medium">{p.firstName} {p.lastName}</td>
                      <td>{p.contactNumber}</td>
                      <td>{p.email}</td>
                      <td>{p.gender}</td>
                      <td className="flex gap-1">
                        <button onClick={() => startEdit(p)} className="rounded p-1 text-muted-foreground hover:bg-accent"><Edit className="size-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {!patients.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No patients found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
