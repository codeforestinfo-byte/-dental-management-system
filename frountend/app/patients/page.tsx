'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { patientService } from '@/services/patient.service'
import type { PatientResponse } from '@/types/patient.types'
import { Plus, Search, Loader2, Edit, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react'

const emptyForm = {
  firstName: '', lastName: '', address: '', contactNumber: '', email: '', dateOfBirth: '', gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER', medicalNotes: '',
  alternatePhone: '', nationalId: '', maritalStatus: '', profilePhotoUrl: '', addressLine2: '', city: '', postalCode: '',
  emergencyContactName: '', emergencyContactNumber: '', emergencyContactRelationship: '',
  bloodGroup: '', allergies: '', currentMedications: '',
  hasDiabetes: false, hasHypertension: false, hasHeartDisease: false, hasAsthma: false, hasEpilepsy: false, hasBleedingDisorders: false,
  pregnancyStatus: '', smokingStatus: '', alcoholConsumption: '',
  chiefComplaint: '', previousDentalTreatments: '', lastDentalVisitDate: '', referredBy: '', preferredDentist: '',
  insuranceProvider: '', insurancePolicyNumber: '', insuranceCoverageDetails: '', insuranceExpiryDate: '',
  registrationDate: '', status: 'ACTIVE', consentAccepted: false,
}

type FormData = typeof emptyForm

const inputClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const selectClass = "flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
const labelClass = "text-sm font-medium text-foreground"
const subLabelClass = "text-xs text-muted-foreground"

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

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientResponse | null>(null)
  const [form, setForm] = useState<FormData>({ ...emptyForm })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState('')

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true, contact: false, emergency: false, medical: false, dental: false, insurance: false, admin: false,
  })
  const toggleSection = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const set = (field: keyof FormData, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }))

  const calculatedAge = form.dateOfBirth ? Math.floor((Date.now() - new Date(form.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : ''

  const fetchPatients = async () => {
    try {
      setLoading(true)
      if (searchQuery) {
        const res = await patientService.search(searchQuery)
        if (res.success) setPatients(res.data || [])
      } else {
        const res = await patientService.getAll({ size: 100 })
        if (res.success) setPatients(res.data || [])
      }
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchPatients() }, [searchQuery])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim()) e.lastName = 'Required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) {
      const missingFields: string[] = []
      if (!form.firstName.trim()) missingFields.push('First Name')
      if (!form.lastName.trim()) missingFields.push('Last Name')
      setApiError('Please fill required fields: ' + missingFields.join(', '))
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {}
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'dateOfBirth' || key === 'lastDentalVisitDate' || key === 'insuranceExpiryDate' || key === 'registrationDate') {
          if (value && value !== '') payload[key] = value
        } else {
          payload[key] = value
        }
      })
      if (editingPatient) {
        await patientService.update(editingPatient.id, payload as any)
      } else {
        await patientService.create(payload as any)
      }
      setShowForm(false)
      setEditingPatient(null)
      setForm({ ...emptyForm })
      setApiError('')
      fetchPatients()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save patient. Please try again.'
      setApiError(msg)
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this patient?')) return
    try {
      await patientService.delete(id)
      fetchPatients()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete patient.'
      setApiError(msg)
    }
  }

  const startEdit = (p: PatientResponse) => {
    setEditingPatient(p)
    setForm({
      firstName: p.firstName || '', lastName: p.lastName || '', address: p.address || '', contactNumber: p.contactNumber || '', email: p.email || '', dateOfBirth: p.dateOfBirth || '', gender: (p.gender as FormData['gender']) || 'MALE', medicalNotes: p.medicalNotes || '',
      alternatePhone: p.alternatePhone || '', nationalId: p.nationalId || '', maritalStatus: p.maritalStatus || '', profilePhotoUrl: p.profilePhotoUrl || '', addressLine2: p.addressLine2 || '', city: p.city || '', postalCode: p.postalCode || '',
      emergencyContactName: p.emergencyContactName || '', emergencyContactNumber: p.emergencyContactNumber || '', emergencyContactRelationship: p.emergencyContactRelationship || '',
      bloodGroup: p.bloodGroup || '', allergies: p.allergies || '', currentMedications: p.currentMedications || '',
      hasDiabetes: p.hasDiabetes || false, hasHypertension: p.hasHypertension || false, hasHeartDisease: p.hasHeartDisease || false, hasAsthma: p.hasAsthma || false, hasEpilepsy: p.hasEpilepsy || false, hasBleedingDisorders: p.hasBleedingDisorders || false,
      pregnancyStatus: p.pregnancyStatus || '', smokingStatus: p.smokingStatus || '', alcoholConsumption: p.alcoholConsumption || '',
      chiefComplaint: p.chiefComplaint || '', previousDentalTreatments: p.previousDentalTreatments || '', lastDentalVisitDate: p.lastDentalVisitDate || '', referredBy: p.referredBy || '', preferredDentist: p.preferredDentist || '',
      insuranceProvider: p.insuranceProvider || '', insurancePolicyNumber: p.insurancePolicyNumber || '', insuranceCoverageDetails: p.insuranceCoverageDetails || '', insuranceExpiryDate: p.insuranceExpiryDate || '',
      registrationDate: p.registrationDate || '', status: p.status || 'ACTIVE', consentAccepted: p.consentAccepted || false,
    })
    setShowForm(true)
  }

  return (
    <DashboardLayout title="Patients">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patients by name, number, email, phone..." className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <Button onClick={() => { setEditingPatient(null); setForm({ ...emptyForm }); setApiError(''); setErrors({}); setShowForm(true) }}><Plus className="mr-2 size-4" />Add Patient</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between border-b border-border px-6 py-4">
            <div>
              <CardTitle className="text-lg">{editingPatient ? 'Edit Patient' : 'New Patient Registration'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{editingPatient ? `Editing ${editingPatient.patientNumber}` : 'Fill in patient details below'}</p>
            </div>
            <button onClick={() => { setShowForm(false); setEditingPatient(null) }} className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X className="size-5" /></button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {apiError}
                </div>
              )}

              {/* Section 1: Basic Information */}
              <SectionHeader title="Section 1: Basic Information" subtitle="Name, DOB, gender, national ID" open={openSections.basic} onToggle={() => toggleSection('basic')} />
              {openSections.basic && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="First Name" required>
                    <input placeholder="e.g. Kumara" value={form.firstName} onChange={e => set('firstName', e.target.value)} required className={inputClass} />
                    {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                  </Field>
                  <Field label="Last Name" required>
                    <input placeholder="e.g. Perera" value={form.lastName} onChange={e => set('lastName', e.target.value)} required className={inputClass} />
                    {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Age">
                    <input value={calculatedAge} readOnly placeholder="Auto-calculated" className={inputClass + " bg-muted/50 cursor-not-allowed"} />
                  </Field>
                  <Field label="Gender">
                    <select value={form.gender} onChange={e => set('gender', e.target.value)} className={selectClass}>
                      <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="National ID / Passport">
                    <input placeholder="e.g. 901234567V" value={form.nationalId} onChange={e => set('nationalId', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Marital Status">
                    <select value={form.maritalStatus} onChange={e => set('maritalStatus', e.target.value)} className={selectClass}>
                      <option value="">Select...</option><option value="SINGLE">Single</option><option value="MARRIED">Married</option><option value="DIVORCED">Divorced</option><option value="WIDOWED">Widowed</option><option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="Profile Photo URL">
                    <input placeholder="https://..." value={form.profilePhotoUrl} onChange={e => set('profilePhotoUrl', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Section 2: Contact Details */}
              <SectionHeader title="Section 2: Contact Details" subtitle="Phone, email, address, emergency contact" open={openSections.contact} onToggle={() => toggleSection('contact')} />
              {openSections.contact && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Mobile Number">
                    <input placeholder="+94 77 123 4567" value={form.contactNumber} onChange={e => set('contactNumber', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Alternate Phone">
                    <input placeholder="+94 11 234 5678" value={form.alternatePhone} onChange={e => set('alternatePhone', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Email">
                    <input type="email" placeholder="kumara@gmail.com" value={form.email} onChange={e => set('email', e.target.value)} className={inputClass} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </Field>
                  <div />
                  <Field label="Address Line 1">
                    <input placeholder="123 Main Street" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Address Line 2">
                    <input placeholder="Apt, Suite, Building" value={form.addressLine2} onChange={e => set('addressLine2', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="City">
                    <input placeholder="Colombo" value={form.city} onChange={e => set('city', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Postal Code">
                    <input placeholder="00100" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Emergency Contact */}
              <SectionHeader title="Emergency Contact" subtitle="Name, number, relationship" open={openSections.emergency} onToggle={() => toggleSection('emergency')} />
              {openSections.emergency && (
                <div className="grid gap-4 sm:grid-cols-3 p-4 border border-border rounded-lg">
                  <Field label="Emergency Contact Name">
                    <input placeholder="Kamani Perera" value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Emergency Contact Number">
                    <input placeholder="+94 77 987 6543" value={form.emergencyContactNumber} onChange={e => set('emergencyContactNumber', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Relationship">
                    <select value={form.emergencyContactRelationship} onChange={e => set('emergencyContactRelationship', e.target.value)} className={selectClass}>
                      <option value="">Select...</option><option value="SPOUSE">Spouse</option><option value="PARENT">Parent</option><option value="CHILD">Child</option><option value="SIBLING">Sibling</option><option value="FRIEND">Friend</option><option value="OTHER">Other</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Section 3: Medical History */}
              <SectionHeader title="Section 3: Medical History" subtitle="Blood group, conditions, allergies, medications" open={openSections.medical} onToggle={() => toggleSection('medical')} />
              {openSections.medical && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Blood Group">
                    <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className={selectClass}>
                      <option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </Field>
                  <Field label="Pregnancy Status">
                    <select value={form.pregnancyStatus} onChange={e => set('pregnancyStatus', e.target.value)} className={selectClass}>
                      <option value="">N/A</option><option value="NOT_PREGNANT">Not Pregnant</option><option value="FIRST_TRIMESTER">1st Trimester</option><option value="SECOND_TRIMESTER">2nd Trimester</option><option value="THIRD_TRIMESTER">3rd Trimester</option>
                    </select>
                  </Field>
                  <Field label="Smoking Status">
                    <select value={form.smokingStatus} onChange={e => set('smokingStatus', e.target.value)} className={selectClass}>
                      <option value="">Select...</option><option value="NEVER">Never</option><option value="FORMER">Former</option><option value="CURRENT">Current</option>
                    </select>
                  </Field>
                  <Field label="Alcohol Consumption">
                    <select value={form.alcoholConsumption} onChange={e => set('alcoholConsumption', e.target.value)} className={selectClass}>
                      <option value="">Select...</option><option value="NEVER">Never</option><option value="OCCASIONAL">Occasional</option><option value="MODERATE">Moderate</option><option value="HEAVY">Heavy</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Medical Conditions</label>
                    <p className={subLabelClass + " mb-2"}>Check all that apply</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {([
                        ['hasDiabetes', 'Diabetes'], ['hasHypertension', 'Hypertension'], ['hasHeartDisease', 'Heart Disease'],
                        ['hasAsthma', 'Asthma'], ['hasEpilepsy', 'Epilepsy'], ['hasBleedingDisorders', 'Bleeding Disorders'],
                      ] as const).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer hover:bg-accent/50 transition-colors">
                          <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} className="size-4 rounded border-border accent-primary" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <Field label="Allergies">
                    <textarea placeholder="List any allergies (e.g., Penicillin, Latex...)" value={form.allergies} onChange={e => set('allergies', e.target.value)} className={inputClass + " min-h-[60px]"} />
                  </Field>
                  <Field label="Current Medications">
                    <textarea placeholder="List current medications" value={form.currentMedications} onChange={e => set('currentMedications', e.target.value)} className={inputClass + " min-h-[60px]"} />
                  </Field>
                  <Field label="Other Medical Notes">
                    <textarea placeholder="Any additional medical information" value={form.medicalNotes} onChange={e => set('medicalNotes', e.target.value)} className={inputClass + " min-h-[60px] sm:col-span-2"} />
                  </Field>
                </div>
              )}

              {/* Section 4: Dental Information */}
              <SectionHeader title="Section 4: Dental Information" subtitle="Complaint, previous treatments, referrals" open={openSections.dental} onToggle={() => toggleSection('dental')} />
              {openSections.dental && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Chief Complaint">
                    <textarea placeholder="Main reason for visit (e.g., toothache, bleeding gums)" value={form.chiefComplaint} onChange={e => set('chiefComplaint', e.target.value)} className={inputClass + " min-h-[60px] sm:col-span-2"} />
                  </Field>
                  <Field label="Previous Dental Treatments">
                    <textarea placeholder="Previous fillings, extractions, root canals, etc." value={form.previousDentalTreatments} onChange={e => set('previousDentalTreatments', e.target.value)} className={inputClass + " min-h-[60px] sm:col-span-2"} />
                  </Field>
                  <Field label="Last Dental Visit Date">
                    <input type="date" value={form.lastDentalVisitDate} onChange={e => set('lastDentalVisitDate', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Preferred Dentist">
                    <input placeholder="Dr. Fernando" value={form.preferredDentist} onChange={e => set('preferredDentist', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Referred By">
                    <input placeholder="Dr. Jayawardena / Self / Website" value={form.referredBy} onChange={e => set('referredBy', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Section 5: Insurance */}
              <SectionHeader title="Section 5: Insurance" subtitle="Provider, policy number, coverage" open={openSections.insurance} onToggle={() => toggleSection('insurance')} />
              {openSections.insurance && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Insurance Provider">
                    <input placeholder="ABC Insurance Co." value={form.insuranceProvider} onChange={e => set('insuranceProvider', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Policy Number">
                    <input placeholder="POL-12345" value={form.insurancePolicyNumber} onChange={e => set('insurancePolicyNumber', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Coverage Details">
                    <textarea placeholder="Coverage limits, co-pay details, etc." value={form.insuranceCoverageDetails} onChange={e => set('insuranceCoverageDetails', e.target.value)} className={inputClass + " min-h-[60px] sm:col-span-2"} />
                  </Field>
                  <Field label="Insurance Expiry Date">
                    <input type="date" value={form.insuranceExpiryDate} onChange={e => set('insuranceExpiryDate', e.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}

              {/* Section 6: System / Administrative */}
              <SectionHeader title="Section 6: System Information" subtitle="Registration date, status" open={openSections.admin} onToggle={() => toggleSection('admin')} />
              {openSections.admin && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg">
                  <Field label="Registration Date">
                    <input type="date" value={form.registrationDate} onChange={e => set('registrationDate', e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Status">
                    <select value={form.status} onChange={e => set('status', e.target.value)} className={selectClass}>
                      <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                    </select>
                  </Field>
                </div>
              )}

              {/* Consent - always visible */}
              <div className="rounded-lg border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-lg px-2 py-1">
                  <input type="checkbox" checked={form.consentAccepted} onChange={e => set('consentAccepted', e.target.checked)} className="size-4 mt-0.5 rounded border-border accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Patient Consent <span className="text-destructive">*</span></p>
                    <p className="text-xs text-muted-foreground">I confirm the information provided is accurate and consent to dental treatment and data processing as per clinic policy.</p>
                  </div>
                </label>
                {errors.consentAccepted && <p className="text-xs text-destructive mt-1 ml-7">{errors.consentAccepted}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingPatient(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="min-w-[120px]">
                  {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : editingPatient ? 'Update Patient' : 'Save Patient'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Patient List Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>NUMBER</th><th>NAME</th><th>CONTACT</th><th>EMAIL</th><th>GENDER</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-xs">{p.patientNumber}</td>
                      <td className="font-medium">{p.firstName} {p.lastName}</td>
                      <td>{p.contactNumber}</td>
                      <td>{p.email}</td>
                      <td>{p.gender}</td>
                      <td><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status}</span></td>
                      <td className="flex gap-1">
                        <button onClick={() => startEdit(p)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Edit"><Edit className="size-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="size-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {!patients.length && <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">No patients found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
