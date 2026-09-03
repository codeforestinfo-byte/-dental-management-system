'use client'

import { useEffect, useState, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dentistService } from '@/services/dentist.service'
import { attendanceService } from '@/services/attendance.service'
import { useAuth } from '@/contexts/AuthContext'
import type { DentistRequest, DentistResponse } from '@/types/dentist.types'
import type { DentistAttendance } from '@/types/attendance.types'
import { Plus, Search, Loader2, Edit, X, CheckCircle2, XCircle, ChevronDown, ChevronUp, Upload, FileText, User, Stethoscope, UserCheck, Clock, Briefcase, CalendarCheck } from 'lucide-react'

const SPECIALIZATIONS = [
  'Orthodontist', 'Endodontist', 'Oral Surgeon', 'Periodontist',
  'Prosthodontist', 'Pediatric Dentist', 'Oral Pathologist',
  'Oral Radiologist', 'General Dentist', 'Others'
]

const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Visiting Consultant']
const DEPARTMENTS = ['General', 'Orthodontics', 'Endodontics', 'Oral Surgery', 'Periodontics', 'Prosthodontics', 'Pediatric Dentistry', 'Others']
const AVAILABLE_DAYS_LIST = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const emptyForm = {
  dentistName: '', gender: 'MALE', dateOfBirth: '', nicNumber: '',
  slmcRegistrationNumber: '', specialization: 'General Dentist', qualification: '',
  yearsOfExperience: '', licenseExpiryDate: '', contactNumber: '', secondaryPhone: '',
  email: '', address: '', joiningDate: '', employmentType: 'Full Time',
  department: 'General', consultationFee: '', followupFee: '',
  status: 'ACTIVE', availableDays: '[]',
}

type FormData = typeof emptyForm

const inputClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const selectClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const labelClass = "text-sm font-medium text-foreground"

function SectionHeader({ title, subtitle, open, onToggle }: { title: string; subtitle: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
    </button>
  )
}

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
      Object.entries(data.data).forEach(([key, val]) => {
        fields[key] = String(val)
      })
    }
  }

  if (!message) {
    message = err?.message || 'An unexpected error occurred. Please try again later.'
  }

  return { message, fields }
}

export default function DentistsPage() {
  const { hasRole } = useAuth()
  const isDentist = hasRole('DENTIST')
  const [dentists, setDentists] = useState<DentistResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDentist, setEditingDentist] = useState<DentistResponse | null>(null)
  const [form, setForm] = useState<FormData>({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string>('')
  const profilePhotoInputRef = useRef<HTMLInputElement>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<'list' | 'attendance'>('list')
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceMap, setAttendanceMap] = useState<Record<number, DentistAttendance>>({})
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [attendanceSaving, setAttendanceSaving] = useState<number | null>(null)
  const [attendanceError, setAttendanceError] = useState('')

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true, professional: false, contact: false, work: false, schedule: false, documents: false,
  })
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const set = (field: keyof FormData, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const fetchDentists = async () => {
    try {
      setLoading(true)
      setApiError('')
      if (isDentist) {
        const res = await dentistService.getMe()
        if (res.success && res.data) {
          setDentists([res.data])
        }
      } else {
        const res = await dentistService.getAll({ size: 100 })
        if (res.success) setDentists(res.data || [])
      }
    } catch (err: any) {
      setApiError(err?.response?.data?.message || err?.message || 'Failed to load dentists.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchDentists() }, [])

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true)
      setAttendanceError('')
      const res = await attendanceService.getByDate(attendanceDate)
      if (res.success && res.data) {
        const map: Record<number, DentistAttendance> = {}
        res.data.forEach((a: DentistAttendance) => { map[a.dentist.id] = a })
        setAttendanceMap(map)
      }
    } catch (err: any) {
      const { message } = extractErrors(err)
      setAttendanceError(message || 'Failed to load attendance data.')
    } finally { setAttendanceLoading(false) }
  }

  useEffect(() => { if (activeTab === 'attendance') fetchAttendance() }, [activeTab, attendanceDate])

  const handleAttendanceToggle = async (dentistId: number) => {
    try {
      setAttendanceSaving(dentistId)
      setAttendanceError('')
      const current = attendanceMap[dentistId]
      const newStatus = current?.status === 'ABSENT' ? 'PRESENT' : 'ABSENT'
      await attendanceService.mark({ dentistId, attendanceDate, status: newStatus })
      await fetchAttendance()
    } catch (err: any) {
      const { message } = extractErrors(err)
      setAttendanceError(message || 'Failed to update attendance. Please try again.')
    } finally { setAttendanceSaving(null) }
  }

  const getAvailableDays = (): string[] => {
    try { return JSON.parse(form.availableDays) } catch { return [] }
  }

  const toggleDay = (day: string) => {
    const current = getAvailableDays()
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day]
    set('availableDays', JSON.stringify(updated))
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.dentistName.trim()) e.dentistName = 'Required'
    if (!form.specialization) e.specialization = 'Required'
    if (!form.slmcRegistrationNumber.trim()) e.slmcRegistrationNumber = 'Required'
    if (!form.contactNumber.trim()) e.contactNumber = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.consultationFee) e.consultationFee = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    setErrors({})
    if (!validate()) {
      setApiError('Please fill all required fields marked with *')
      return
    }
    setSubmitting(true)
    try {
      const payload: DentistRequest = {
        dentistName: form.dentistName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || '',
        nicNumber: form.nicNumber,
        slmcRegistrationNumber: form.slmcRegistrationNumber,
        specialization: form.specialization,
        qualification: form.qualification,
        yearsOfExperience: form.yearsOfExperience || '',
        licenseExpiryDate: form.licenseExpiryDate || '',
        contactNumber: form.contactNumber,
        secondaryPhone: form.secondaryPhone,
        email: form.email,
        address: form.address,
        joiningDate: form.joiningDate || '',
        employmentType: form.employmentType,
        department: form.department,
        consultationFee: form.consultationFee || '',
        followupFee: form.followupFee || '',
        status: form.status,
        availableDays: form.availableDays,
      }

      if (editingDentist) {
        await dentistService.update(editingDentist.id, payload, profilePhotoFile, resumeFile)
      } else {
        await dentistService.create(payload, profilePhotoFile, resumeFile)
      }
      resetForm()
      fetchDentists()
    } catch (err: any) {
      const { message, fields } = extractErrors(err)
      setApiError(message)
      if (Object.keys(fields).length > 0) {
        setErrors(prev => ({ ...prev, ...fields }))
      }
    } finally { setSubmitting(false) }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this dentist?')) return
    try { await dentistService.deactivate(id); fetchDentists() } catch (err: any) {
      const { message } = extractErrors(err)
      setApiError(message)
    }
  }

  const startEdit = (d: DentistResponse) => {
    setEditingDentist(d)
    setForm({
      dentistName: d.dentistName || '', gender: d.gender || 'MALE', dateOfBirth: d.dateOfBirth || '',
      nicNumber: d.nicNumber || '', slmcRegistrationNumber: d.slmcRegistrationNumber || '',
      specialization: d.specialization || '', qualification: d.qualification || '',
      yearsOfExperience: d.yearsOfExperience?.toString() || '', licenseExpiryDate: d.licenseExpiryDate || '',
      contactNumber: d.contactNumber || '', secondaryPhone: d.secondaryPhone || '',
      email: d.email || '', address: d.address || '', joiningDate: d.joiningDate || '',
      employmentType: d.employmentType || 'Full Time', department: d.department || 'General',
      consultationFee: d.consultationFee?.toString() || '', followupFee: d.followupFee?.toString() || '',
      status: d.status || 'ACTIVE', availableDays: d.availableDays || '[]',
    })
    setProfilePhotoFile(null)
    setProfilePhotoPreview(d.profilePhotoUrl || '')
    setResumeFile(null)
    setResumeFileName(d.resumeUrl ? d.resumeUrl.split('/').pop() || '' : '')
    setApiError('')
    setErrors({})
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingDentist(null)
    setForm({ ...emptyForm })
    setProfilePhotoFile(null)
    setProfilePhotoPreview('')
    setResumeFile(null)
    setResumeFileName('')
    setErrors({})
    setApiError('')
  }

  return (
    <DashboardLayout title="Dentists">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Dentists', dentists.length.toString(), dentists.length > 0 ? `${dentists.length} registered` : 'No dentists yet', Stethoscope, 'text-blue-600'],
          ['Active Dentists', dentists.filter(d => d.active).length.toString(), 'Currently active', UserCheck, 'text-emerald-600'],
          ['Full Time', dentists.filter(d => d.employmentType === 'Full Time').length.toString(), 'Full time staff', Clock, 'text-violet-600'],
          ['Part Time / Visiting', dentists.filter(d => d.employmentType !== 'Full Time').length.toString(), 'Part time & visiting', Briefcase, 'text-pink-600'],
        ].map(([label, value, meta, Icon, colorClass]) => (
          <Card key={label as string} className="metric-card"><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-medium text-muted-foreground">{label as string}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value as string}</p><p className="mt-1 text-[11px] text-muted-foreground">{meta as string}</p></div><div className={`icon-box ${colorClass}`}><Icon className="size-4" /></div></div></CardContent></Card>
        ))}
      </div>

      <div className="mt-6 mb-4 flex gap-2">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
          <User className="mr-1 inline size-3.5" />Dentist Profile
        </button>
        {!isDentist && (
          <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
            <CalendarCheck className="mr-1 inline size-3.5" />Attendance
          </button>
        )}
      </div>

      {activeTab === 'attendance' ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Dentist Attendance</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Select Date:</span>
              <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="flex h-9 rounded-lg border border-border bg-background px-3 py-1 text-sm outline-none focus:border-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {attendanceError && (
              <div className="mb-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{attendanceError}</div>
            )}
            {attendanceLoading ? (
              <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {dentists.filter(d => d.active).map(d => {
                  const record = attendanceMap[d.id]
                  const isAbsent = record?.status === 'ABSENT'
                  const isSaving = attendanceSaving === d.id
                  return (
                    <div key={d.id} className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${isAbsent ? 'border-red-200 bg-red-50/50' : 'border-border bg-green-50/30'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${isAbsent ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isAbsent ? 'AB' : 'PR'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{d.dentistName}</p>
                          <p className="text-xs text-muted-foreground">{d.specialization} - {d.department}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAttendanceToggle(d.id)}
                        disabled={isSaving}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isAbsent ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {isSaving ? <Loader2 className="size-3 animate-spin inline" /> : isAbsent ? 'Mark Present' : 'Mark Absent'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!isDentist && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search dentists..." className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
        )}
        {isDentist && <div />}
        {!isDentist && <Button onClick={() => { resetForm(); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Dentist</Button>}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <div>
              <CardTitle className="text-lg">{editingDentist ? 'Edit Dentist' : 'Add New Dentist'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{editingDentist ? `Editing ${editingDentist.dentistCode}` : 'Fill in dentist details below'}</p>
            </div>
            <button onClick={resetForm} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X className="size-5" /></button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{apiError}</div>
              )}

              {/* Section 1: Basic Information */}
              <SectionHeader title="Section 1: Basic Information" subtitle="Name, gender, DOB, profile photo, NIC" open={openSections.basic} onToggle={() => toggleSection('basic')} />
              {openSections.basic && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Full Name" required>
                    <input placeholder="Dr. Sasindi Dilanka Rathnayaka" value={form.dentistName} onChange={e => set('dentistName', e.target.value)} className={inputClass} />
                    {errors.dentistName && <p className="text-xs text-destructive mt-1">{errors.dentistName}</p>}
                  </Field>
                  <Field label="Gender">
                    <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectClass}>
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="NIC / Passport Number">
                    <input placeholder="123456789V" value={form.nicNumber} onChange={e => set('nicNumber', e.target.value)} className={inputClass} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Profile Photo">
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                          {profilePhotoPreview ? (
                            <img src={profilePhotoPreview.startsWith('http') || profilePhotoPreview.startsWith('blob:') ? profilePhotoPreview : `http://localhost:8080${profilePhotoPreview}`} alt="Profile" className="size-full object-cover" />
                          ) : (
                            <User className="size-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <input ref={profilePhotoInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setProfilePhotoFile(file)
                              setProfilePhotoPreview(URL.createObjectURL(file))
                            }
                          }} />
                          <Button type="button" variant="outline" size="sm" onClick={() => profilePhotoInputRef.current?.click()}>
                            <Upload className="mr-2 size-3" />Choose Photo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 10MB</p>
                        </div>
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* Section 2: Professional Information */}
              <SectionHeader title="Section 2: Professional Information" subtitle="Dentist ID, specialization, SLMC, qualifications" open={openSections.professional} onToggle={() => toggleSection('professional')} />
              {openSections.professional && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Dentist ID">
                    <input value={editingDentist?.dentistCode || 'Auto-generated on save'} readOnly className={inputClass + " bg-muted/50 cursor-not-allowed"} />
                  </Field>
                  <Field label="SLMC Registration Number" required>
                    <input placeholder="SLMC-12345" value={form.slmcRegistrationNumber} onChange={e => set('slmcRegistrationNumber', e.target.value)} className={inputClass} />
                    {errors.slmcRegistrationNumber && <p className="text-xs text-destructive mt-1">{errors.slmcRegistrationNumber}</p>}
                  </Field>
                  <Field label="Specialization" required>
                    <select value={form.specialization} onChange={e => set('specialization', e.target.value)} className={selectClass}>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.specialization && <p className="text-xs text-destructive mt-1">{errors.specialization}</p>}
                  </Field>
                  <Field label="Qualification">
                    <input placeholder="BDS, MDS, DDS" value={form.qualification} onChange={e => set('qualification', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Years of Experience">
                    <input type="number" min="0" max="60" placeholder="0" value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="License Expiry Date">
                    <input type="date" value={form.licenseExpiryDate} onChange={e => set('licenseExpiryDate', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Section 3: Contact Information */}
              <SectionHeader title="Section 3: Contact Information" subtitle="Phone, email, address" open={openSections.contact} onToggle={() => toggleSection('contact')} />
              {openSections.contact && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Mobile Number" required>
                    <input placeholder="+94 77 123 4567" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} className={inputClass} />
                    {errors.contactNumber && <p className="text-xs text-destructive mt-1">{errors.contactNumber}</p>}
                  </Field>
                  <Field label="Secondary Phone">
                    <input placeholder="+94 11 234 5678" value={form.secondaryPhone} onChange={e => set('secondaryPhone', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Email Address" required>
                    <input type="email" placeholder="dr.john@clinic.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </Field>
                  <div />
                  <Field label="Address" required>
                    <textarea placeholder="123 Dental Street, Colombo" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass + " min-h-[60px] sm:col-span-2"} />
                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                  </Field>
                </div>
              )}

              {/* Section 4: Work Information */}
              <SectionHeader title="Section 4: Work Information" subtitle="Joining date, employment type, department, fees" open={openSections.work} onToggle={() => toggleSection('work')} />
              {openSections.work && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Joining Date">
                    <input type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Employment Type">
                    <select value={form.employmentType} onChange={e => set('employmentType', e.target.value)} className={selectClass}>
                      {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Department">
                    <select value={form.department} onChange={e => set('department', e.target.value)} className={selectClass}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={selectClass}>
                      <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                    </select>
                  </Field>
                  <Field label="Consultation Fee (LKR)" required>
                    <input type="number" min="0" step="100" placeholder="2500" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} className={inputClass} />
                    {errors.consultationFee && <p className="text-xs text-destructive mt-1">{errors.consultationFee}</p>}
                  </Field>
                  <Field label="Follow-up Fee (LKR)">
                    <input type="number" min="0" step="100" placeholder="1500" value={form.followupFee} onChange={e => set('followupFee', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Section 5: Schedule & Availability */}
              <SectionHeader title="Section 5: Schedule & Availability" subtitle="Select available working days" open={openSections.schedule} onToggle={() => toggleSection('schedule')} />
              {openSections.schedule && (
                <div className="p-4 border border-border rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-3">Available Days</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_DAYS_LIST.map(day => {
                      const selected = getAvailableDays().includes(day)
                      return (
                        <button key={day} type="button" onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:bg-accent'}`}>
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Selected: {getAvailableDays().length > 0 ? getAvailableDays().join(', ') : 'None'}</p>
                </div>
              )}

              {/* Section 6: Documents */}
              <SectionHeader title="Section 6: Documents" subtitle="Resume / CV upload (PDF)" open={openSections.documents} onToggle={() => toggleSection('documents')} />
              {openSections.documents && (
                <div className="p-4 border border-border rounded-lg">
                  <Field label="Resume / CV (PDF)">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setResumeFile(file)
                            setResumeFileName(file.name)
                          }
                        }} />
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => resumeInputRef.current?.click()}>
                            <Upload className="mr-2 size-3" />Choose File
                          </Button>
                          {resumeFileName && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <FileText className="size-3" />{resumeFileName}
                            </span>
                          )}
                          {editingDentist?.resumeUrl && !resumeFile && (
                            <a href={`http://localhost:8080${editingDentist.resumeUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">View current resume</a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX. Max 10MB</p>
                      </div>
                    </div>
                  </Field>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="min-w-[120px]">
                  {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingDentist ? 'Update Dentist' : 'Save Dentist'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Dentist List Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>CODE</th><th>NAME</th><th>SPECIALIZATION</th><th>SLMC</th><th>CONTACT</th><th>DEPT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {dentists.map(d => (
                    <tr key={d.id}>
                      <td className="font-mono text-xs">{d.dentistCode}</td>
                      <td className="font-medium">{d.dentistName}</td>
                      <td>{d.specialization}</td>
                      <td className="text-xs">{d.slmcRegistrationNumber}</td>
                      <td>{d.contactNumber}</td>
                      <td>{d.department}</td>
                      <td>{d.active ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="size-3" />Active</span> : <span className="flex items-center gap-1 text-xs text-muted-foreground"><XCircle className="size-3" />Inactive</span>}</td>
                      <td className="flex gap-1">
                        {!isDentist && <button onClick={() => startEdit(d)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Edit"><Edit className="size-4" /></button>}
                        {!isDentist && d.active && <button onClick={() => handleDeactivate(d.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Deactivate"><XCircle className="size-4" /></button>}
                      </td>
                    </tr>
                  ))}
                  {!dentists.length && <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">No dentists found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </>
      )}
    </DashboardLayout>
  )
}
