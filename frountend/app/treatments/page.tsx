'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { treatmentService } from '@/services/treatment.service'
import type { TreatmentResponse } from '@/types/treatment.types'
import { Plus, Search, Loader2, Edit, X, CheckCircle2, XCircle, Clock, Tag } from 'lucide-react'

const CATEGORIES = [
  'Diagnostic', 'Preventive', 'Restorative', 'Endodontic',
  'Orthodontic', 'Prosthodontic', 'Surgical', 'Cosmetic', 'Other'
]

const DURATIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
]

const categoryColor: Record<string, string> = {
  Diagnostic: 'bg-blue-100 text-blue-800',
  Preventive: 'bg-green-100 text-green-800',
  Restorative: 'bg-amber-100 text-amber-800',
  Endodontic: 'bg-red-100 text-red-800',
  Orthodontic: 'bg-purple-100 text-purple-800',
  Prosthodontic: 'bg-indigo-100 text-indigo-800',
  Surgical: 'bg-rose-100 text-rose-800',
  Cosmetic: 'bg-pink-100 text-pink-800',
  Other: 'bg-gray-100 text-gray-800',
}

const emptyForm = {
  treatmentName: '', description: '', category: 'Diagnostic',
  treatmentFee: '', estimatedDurationMinutes: '30',
}

type FormData = typeof emptyForm

const inputClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const selectClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const labelClass = "text-sm font-medium text-foreground"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className={labelClass}>{label}{required && <span className="text-destructive ml-1">*</span>}</label>
      {children}
    </div>
  )
}

function extractErrors(err: any): { message: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {}
  let message = ''
  if (err?.response?.data) {
    const data = err.response.data
    message = data.message || ''
    if (data.data && typeof data.data === 'object') {
      Object.entries(data.data).forEach(([key, val]) => { fields[key] = String(val) })
    }
  }
  if (!message) message = err?.message || 'An unexpected error occurred.'
  return { message, fields }
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<TreatmentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<TreatmentResponse | null>(null)
  const [form, setForm] = useState<FormData>({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  const set = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const fetchTreatments = async () => {
    try {
      setLoading(true)
      setApiError('')
      const res = await treatmentService.getAll({ size: 100 })
      if (res.success) setTreatments(res.data || [])
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || 'Failed to load treatments.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTreatments() }, [])

  const filtered = treatments.filter(t => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      t.treatmentName.toLowerCase().includes(q) ||
      t.treatmentCode.toLowerCase().includes(q) ||
      (t.category || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    )
  })

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.treatmentName.trim()) e.treatmentName = 'Required'
    if (!form.treatmentFee || Number(form.treatmentFee) <= 0) e.treatmentFee = 'Must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setErrors({})
    if (!validate()) {
      setApiError('Please fill all required fields.')
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        treatmentName: form.treatmentName.trim(),
        description: form.description.trim(),
        category: form.category,
        treatmentFee: Number(form.treatmentFee),
        estimatedDurationMinutes: form.estimatedDurationMinutes || '',
      }
      if (editingTreatment) {
        await treatmentService.update(editingTreatment.id, payload as any)
      } else {
        await treatmentService.create(payload as any)
      }
      resetForm()
      fetchTreatments()
    } catch (err: any) {
      const { message, fields } = extractErrors(err)
      setApiError(message)
      if (Object.keys(fields).length > 0) setErrors(prev => ({ ...prev, ...fields }))
    } finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this treatment? It will no longer be available for new appointments.')) return
    try {
      await treatmentService.deactivate(id)
      fetchTreatments()
    } catch (err: any) {
      const { message } = extractErrors(err)
      setApiError(message)
    }
  }

  const startEdit = (t: TreatmentResponse) => {
    setEditingTreatment(t)
    setForm({
      treatmentName: t.treatmentName || '',
      description: t.description || '',
      category: t.category || 'Other',
      treatmentFee: t.treatmentFee?.toString() || '',
      estimatedDurationMinutes: t.estimatedDurationMinutes?.toString() || '30',
    })
    setApiError('')
    setErrors({})
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingTreatment(null)
    setForm({ ...emptyForm })
    setErrors({})
    setApiError('')
  }

  const formatFee = (fee: number) => `LKR ${fee.toLocaleString()}`

  const formatDuration = (mins: number | null) => {
    if (!mins) return '-'
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}min` : `${h}h`
  }

  return (
    <DashboardLayout title="Treatments">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search treatments by name, code, or category..." className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Treatment</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <div>
              <CardTitle className="text-lg">{editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{editingTreatment ? `Editing ${editingTreatment.treatmentCode}` : 'Fill in treatment details below'}</p>
            </div>
            <button onClick={resetForm} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X className="size-5" /></button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{apiError}</div>
              )}

              {/* Section 1: Basic Information */}
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Treatment Details</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Treatment Name" required>
                    <input placeholder="e.g. Dental Filling" value={form.treatmentName} onChange={e => set('treatmentName', e.target.value)} className={inputClass} />
                    {errors.treatmentName && <p className="text-xs text-destructive mt-1">{errors.treatmentName}</p>}
                  </Field>
                  <Field label="Category">
                    <select value={form.category} onChange={e => set('category', e.target.value)} className={selectClass}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description">
                      <textarea placeholder="Describe the treatment procedure, indications, and any notes..." value={form.description} onChange={e => set('description', e.target.value)} className={inputClass + " min-h-[80px]"} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Duration */}
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground mb-3">Pricing & Duration</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Treatment Fee (LKR)" required>
                    <input type="number" min="0" step="100" placeholder="e.g. 3000" value={form.treatmentFee} onChange={e => set('treatmentFee', e.target.value)} className={inputClass} />
                    {errors.treatmentFee && <p className="text-xs text-destructive mt-1">{errors.treatmentFee}</p>}
                  </Field>
                  <Field label="Estimated Duration">
                    <select value={form.estimatedDurationMinutes} onChange={e => set('estimatedDurationMinutes', e.target.value)} className={selectClass}>
                      {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="min-w-[120px]">
                  {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingTreatment ? 'Update Treatment' : 'Save Treatment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Treatment List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CODE</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>FEE (LKR)</th>
                    <th>DURATION</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.treatmentCode}</td>
                      <td className="font-medium">
                        <div>{t.treatmentName}</div>
                        {t.description && <p className="text-xs text-muted-foreground max-w-[250px] truncate mt-0.5">{t.description}</p>}
                      </td>
                      <td>
                        {t.category ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor[t.category] || categoryColor.Other}`}>
                            {t.category}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">-</span>}
                      </td>
                      <td className="font-medium">{formatFee(t.treatmentFee)}</td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {formatDuration(t.estimatedDurationMinutes)}
                        </span>
                      </td>
                      <td>
                        {t.active ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-3" />Active</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3" />Inactive</span>
                        )}
                      </td>
                      <td className="flex gap-1">
                        <button onClick={() => startEdit(t)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Edit"><Edit className="size-4" /></button>
                        {t.active && (
                          <button onClick={() => handleDeactivate(t.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Deactivate"><XCircle className="size-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!filtered.length && (
                    <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                      {searchQuery ? 'No treatments match your search.' : 'No treatments found.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {!loading && treatments.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{treatments.length} total treatments</span>
          <span>{filtered.length} showing{searchQuery ? ` (filtered from ${treatments.length})` : ''}</span>
        </div>
      )}
    </DashboardLayout>
  )
}
