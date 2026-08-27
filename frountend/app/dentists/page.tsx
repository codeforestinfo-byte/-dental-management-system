'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dentistService } from '@/services/dentist.service'
import type { DentistResponse } from '@/types/dentist.types'
import { Plus, Loader2, Edit, X, CheckCircle2, XCircle } from 'lucide-react'

export default function DentistsPage() {
  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDentist, setEditingDentist] = useState<DentistResponse | null>(null)
  const [form, setForm] = useState({ dentistName: '', specialization: '', contactNumber: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const fetchDentists = async () => {
    try {
      setLoading(true)
      setApiError('')
      const res = await dentistService.getAll({ size: 100 })
      if (res.success) setDentists(res.data || [])
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || 'Failed to load dentists.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDentists() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setApiError('')
    try {
      if (editingDentist) { await dentistService.update(editingDentist.id, form) }
      else { await dentistService.create(form) }
      setShowForm(false); setEditingDentist(null)
      setForm({ dentistName: '', specialization: '', contactNumber: '', email: '' })
      fetchDentists()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save dentist.'
      setApiError(msg)
    } finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this dentist?')) return
    try { await dentistService.deactivate(id); fetchDentists() } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to deactivate dentist.'
      setApiError(msg)
    }
  }

  return (
    <DashboardLayout title="Dentists">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => { setEditingDentist(null); setForm({ dentistName: '', specialization: '', contactNumber: '', email: '' }); setApiError(''); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Dentist</Button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm">{editingDentist ? 'Edit Dentist' : 'New Dentist'}</CardTitle><button onClick={() => { setShowForm(false); setEditingDentist(null) }}><X className="size-4" /></button></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Full Name" value={form.dentistName} onChange={e => setForm({ ...form, dentistName: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Contact Number" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingDentist(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingDentist ? 'Update' : 'Create'}</Button>
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
                <thead><tr><th>CODE</th><th>NAME</th><th>SPECIALIZATION</th><th>CONTACT</th><th>EMAIL</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {dentists.map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-xs">{d.dentistCode}</td>
                      <td className="font-medium">{d.dentistName}</td>
                      <td>{d.specialization}</td>
                      <td>{d.contactNumber}</td>
                      <td>{d.email}</td>
                      <td>{d.active ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-3" />Active</span> : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3" />Inactive</span>}</td>
                      <td className="flex gap-1">
                        <button onClick={() => { setEditingDentist(d); setForm({ dentistName: d.dentistName, specialization: d.specialization, contactNumber: d.contactNumber, email: d.email }); setShowForm(true) }} className="rounded p-1 text-muted-foreground hover:bg-accent"><Edit className="size-4" /></button>
                        {d.active && <button onClick={() => handleDeactivate(d.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><XCircle className="size-4" /></button>}
                      </td>
                    </tr>
                  ))}
                  {!dentists.length && <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No dentists found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
