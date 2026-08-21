'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { treatmentService } from '@/services/treatment.service'
import type { TreatmentResponse } from '@/types/treatment.types'
import { Plus, Loader2, Edit, X, CheckCircle2, XCircle } from 'lucide-react'

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<TreatmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<TreatmentResponse | null>(null)
  const [form, setForm] = useState({ treatmentName: '', description: '', treatmentFee: 0 })
  const [submitting, setSubmitting] = useState(false)

  const fetchTreatments = async () => {
    try {
      setLoading(true)
      const res = await treatmentService.getAll({ size: 100 })
      if (res.success) setTreatments(res.data?.content || [])
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchTreatments() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingTreatment) { await treatmentService.update(editingTreatment.id, form) }
      else { await treatmentService.create(form) }
      setShowForm(false); setEditingTreatment(null)
      setForm({ treatmentName: '', description: '', treatmentFee: 0 })
      fetchTreatments()
    } catch { /* empty */ } finally { setSubmitting(false) }
  }

  return (
    <DashboardLayout title="Treatments">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => { setEditingTreatment(null); setForm({ treatmentName: '', description: '', treatmentFee: 0 }); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Treatment</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm">{editingTreatment ? 'Edit Treatment' : 'New Treatment'}</CardTitle><button onClick={() => { setShowForm(false); setEditingTreatment(null) }}><X className="size-4" /></button></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Treatment Name" value={form.treatmentName} onChange={e => setForm({ ...form, treatmentName: e.target.value })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <input placeholder="Fee (LKR)" type="number" value={form.treatmentFee || ''} onChange={e => setForm({ ...form, treatmentFee: parseFloat(e.target.value) || 0 })} required className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="flex min-h-[80px] rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary sm:col-span-2" />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTreatment(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingTreatment ? 'Update' : 'Create'}</Button>
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
                <thead><tr><th>CODE</th><th>NAME</th><th>DESCRIPTION</th><th>FEE (LKR)</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {treatments.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.treatmentCode}</td>
                      <td className="font-medium">{t.treatmentName}</td>
                      <td className="max-w-[200px] truncate">{t.description}</td>
                      <td>{t.treatmentFee.toLocaleString()}</td>
                      <td>{t.active ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-3" />Active</span> : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3" />Inactive</span>}</td>
                      <td>
                        <button onClick={() => { setEditingTreatment(t); setForm({ treatmentName: t.treatmentName, description: t.description, treatmentFee: t.treatmentFee }); setShowForm(true) }} className="rounded p-1 text-muted-foreground hover:bg-accent"><Edit className="size-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {!treatments.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No treatments found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
