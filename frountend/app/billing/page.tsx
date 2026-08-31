'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { billingService } from '@/services/billing.service'
import type { BillResponse, AppointmentWithoutBill, PaymentRequest } from '@/types/billing.types'
import {
  Loader2, CreditCard, Download, X, Search, ChevronLeft, ChevronRight,
  Plus, Eye, RotateCcw, FileText, AlertTriangle,
} from 'lucide-react'

export default function BillingPage() {
  const [bills, setBills] = useState<BillResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [showPayment, setShowPayment] = useState<number | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentRequest>({ paymentMethod: 'CASH', paymentAmount: 0, reference: '' })
  const [submitting, setSubmitting] = useState(false)

  const [showDetail, setShowDetail] = useState<BillResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [showGenerate, setShowGenerate] = useState(false)
  const [appointments, setAppointments] = useState<AppointmentWithoutBill[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [confirmRefund, setConfirmRefund] = useState<number | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true)
      const res = await billingService.getAll({ page, size: 10, sortBy: 'id', sortDir: 'desc', status: statusFilter || undefined, search: search || undefined })
      if (res.success) {
        setBills(res.data || [])
        setTotalPages(res.totalPages || 1)
        setTotalElements(res.totalElements || 0)
      }
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to load bills')
    } finally { setLoading(false) }
  }, [page, statusFilter, search])

  useEffect(() => { fetchBills() }, [fetchBills])

  const handlePayment = async (billId: number) => {
    if (paymentForm.paymentAmount <= 0) { showToast('error', 'Payment amount must be positive'); return }
    if (paymentForm.paymentAmount > (showPayment ? bills.find(b => b.id === billId)?.balance ?? Infinity : Infinity)) {
      showToast('error', 'Payment amount exceeds balance'); return
    }
    setSubmitting(true)
    try {
      await billingService.processPayment(billId, paymentForm)
      setShowPayment(null)
      setPaymentForm({ paymentMethod: 'CASH', paymentAmount: 0, reference: '' })
      showToast('success', 'Payment processed successfully')
      fetchBills()
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Payment failed')
    } finally { setSubmitting(false) }
  }

  const handleRefund = async (billId: number) => {
    try {
      await billingService.processRefund(billId)
      setConfirmRefund(null)
      showToast('success', 'Bill refunded successfully')
      fetchBills()
      if (showDetail?.id === billId) setShowDetail(null)
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Refund failed')
    }
  }

  const handleDownloadPdf = async (id: number) => {
    try {
      const blob = await billingService.downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `bill-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { showToast('error', 'Failed to download PDF') }
  }

  const handleViewDetail = async (bill: BillResponse) => {
    setDetailLoading(true)
    setShowDetail(bill)
    try {
      const res = await billingService.getById(bill.id)
      if (res.success && res.data) setShowDetail(res.data)
    } catch { /* keep showing basic data */ } finally { setDetailLoading(false) }
  }

  const handleGenerateBill = async (appointmentId: number) => {
    setGenerating(true)
    try {
      await billingService.generateForAppointment(appointmentId)
      setShowGenerate(false)
      showToast('success', 'Bill generated successfully')
      fetchBills()
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Failed to generate bill')
    } finally { setGenerating(false) }
  }

  const openGenerateModal = async () => {
    setShowGenerate(true)
    setAppointmentsLoading(true)
    try {
      const res = await billingService.getCompletedAppointmentsWithoutBills()
      if (res.success) setAppointments(res.data || [])
    } catch { showToast('error', 'Failed to load appointments') } finally { setAppointmentsLoading(false) }
  }

  const statusColor = (s: string) => {
    if (s === 'PAID') return 'status-badge success'
    if (s === 'PARTIAL') return 'status-badge warning'
    if (s === 'REFUNDED') return 'status-badge info'
    return 'status-badge danger'
  }

  return (
    <DashboardLayout title="Billing">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] rounded-lg border px-4 py-3 text-sm shadow-lg transition-all ${toast.type === 'success' ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-destructive/50 bg-destructive/10 text-destructive'}`}>
          {toast.message}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by bill #, patient name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              onKeyDown={e => { if (e.key === 'Enter') fetchBills() }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
            className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
        <Button onClick={openGenerateModal}><Plus className="mr-2 size-4" />Generate Bill</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">All Bills ({totalElements})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  <th>BILL #</th><th>PATIENT</th><th>TREATMENT</th><th>TOTAL</th><th>PAID</th><th>BALANCE</th><th>STATUS</th><th>ACTIONS</th>
                </tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs">{b.billNumber}</td>
                      <td className="font-medium">{b.patientName}</td>
                      <td>{b.treatmentName}</td>
                      <td>LKR {Number(b.totalAmount).toLocaleString()}</td>
                      <td>LKR {Number(b.amountPaid).toLocaleString()}</td>
                      <td>LKR {Number(b.balance).toLocaleString()}</td>
                      <td><span className={statusColor(b.billStatus)}>{b.billStatus}</span></td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => handleViewDetail(b)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="View Details"><Eye className="size-4" /></button>
                          {b.billStatus !== 'PAID' && b.billStatus !== 'REFUNDED' && (
                            <button onClick={() => { setShowPayment(b.id); setPaymentForm({ paymentMethod: 'CASH', paymentAmount: Number(b.balance), reference: '' }) }} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Process Payment"><CreditCard className="size-4" /></button>
                          )}
                          {b.billStatus === 'PAID' && (
                            <button onClick={() => setConfirmRefund(b.id)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Refund"><RotateCcw className="size-4" /></button>
                          )}
                          <button onClick={() => handleDownloadPdf(b.id)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Download PDF"><Download className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!bills.length && <tr><td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">No bills found.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" />Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next<ChevronRight className="size-4" /></Button>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Process Payment</CardTitle>
              <button onClick={() => setShowPayment(null)}><X className="size-4" /></button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
                  <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as PaymentRequest['paymentMethod'] })} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="MOBILE">Mobile</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Amount (LKR)</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={paymentForm.paymentAmount || ''} onChange={e => setPaymentForm({ ...paymentForm, paymentAmount: parseFloat(e.target.value) || 0 })} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Reference</label>
                  <input placeholder="e.g. Receipt #, Transaction ID" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPayment(null)}>Cancel</Button>
                  <Button onClick={() => handlePayment(showPayment)} disabled={submitting || paymentForm.paymentAmount <= 0}>
                    {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Processing...</> : 'Submit Payment'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Bill Details</CardTitle>
              <button onClick={() => setShowDetail(null)}><X className="size-4" /></button>
            </CardHeader>
            <CardContent>
              {detailLoading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-lg font-bold">{showDetail.billNumber}</p>
                      <p className="text-sm text-muted-foreground">Created: {new Date(showDetail.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={statusColor(showDetail.billStatus)}>{showDetail.billStatus}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 text-sm">
                    <div><span className="text-muted-foreground">Patient</span><p className="font-medium">{showDetail.patientName}</p></div>
                    <div><span className="text-muted-foreground">Dentist</span><p className="font-medium">{showDetail.dentistName}</p></div>
                    <div><span className="text-muted-foreground">Treatment</span><p className="font-medium">{showDetail.treatmentName}</p></div>
                    <div><span className="text-muted-foreground">Appointment ID</span><p className="font-medium">#{showDetail.appointmentId}</p></div>
                  </div>

                  <div className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Consultation Fee</span><span>LKR {Number(showDetail.consultationFee).toLocaleString()}</span></div>
                    <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Treatment Fee</span><span>LKR {Number(showDetail.treatmentFee).toLocaleString()}</span></div>
                    <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span>Total</span><span>LKR {Number(showDetail.totalAmount).toLocaleString()}</span></div>
                    <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-emerald-600">LKR {Number(showDetail.amountPaid).toLocaleString()}</span></div>
                    <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Balance</span><span className={Number(showDetail.balance) > 0 ? 'text-amber-600' : 'text-emerald-600'}>LKR {Number(showDetail.balance).toLocaleString()}</span></div>
                  </div>

                  {showDetail.payments && showDetail.payments.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Payment History</h4>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-border bg-muted/50">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">DATE</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">METHOD</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">AMOUNT</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">REFERENCE</th>
                          </tr></thead>
                          <tbody>
                            {showDetail.payments.map(p => (
                              <tr key={p.id} className="border-b border-border last:border-0">
                                <td className="px-3 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td className="px-3 py-2">{p.paymentMethod}</td>
                                <td className="px-3 py-2 text-right">LKR {Number(p.paymentAmount).toLocaleString()}</td>
                                <td className="px-3 py-2 text-muted-foreground">{p.reference || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleDownloadPdf(showDetail.id)}><Download className="mr-2 size-4" />PDF</Button>
                    {showDetail.billStatus !== 'PAID' && showDetail.billStatus !== 'REFUNDED' && (
                      <Button onClick={() => { setShowDetail(null); setShowPayment(showDetail.id); setPaymentForm({ paymentMethod: 'CASH', paymentAmount: Number(showDetail.balance), reference: '' }) }}>
                        <CreditCard className="mr-2 size-4" />Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Generate Bill for Appointment</CardTitle>
              <button onClick={() => setShowGenerate(false)}><X className="size-4" /></button>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
              ) : !appointments.length ? (
                <div className="flex flex-col items-center p-8 text-center">
                  <FileText className="mb-3 size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No completed appointments without bills.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="mb-2 text-sm text-muted-foreground">Select a completed appointment to generate a bill:</p>
                  {appointments.map(a => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.patientName}</p>
                        <p className="text-xs text-muted-foreground">{a.dentistName} &middot; {a.treatmentName}</p>
                        <p className="text-xs text-muted-foreground">{a.appointmentNumber} &middot; {a.appointmentDate}</p>
                      </div>
                      <Button size="sm" onClick={() => handleGenerateBill(a.id)} disabled={generating}>
                        {generating ? <Loader2 className="size-4 animate-spin" /> : 'Generate'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {confirmRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm">Confirm Refund</CardTitle>
              <button onClick={() => setConfirmRefund(null)}><X className="size-4" /></button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="mb-3 size-10 text-amber-500" />
                <p className="text-sm">Are you sure you want to refund this bill? This action cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setConfirmRefund(null)}>Cancel</Button>
                  <Button variant="destructive" onClick={() => handleRefund(confirmRefund)}>Refund Bill</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
