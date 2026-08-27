'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { billingService } from '@/services/billing.service'
import type { BillResponse } from '@/types/billing.types'
import { Loader2, CreditCard, Download } from 'lucide-react'

export default function BillingPage() {
  const [bills, setBills] = useState<BillResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState<number | null>(null)
  const [paymentForm, setPaymentForm] = useState({ paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE', paymentAmount: 0, reference: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchBills = async () => {
    try {
      setLoading(true)
      const res = await billingService.getAll({ size: 100 })
      if (res.success) setBills(res.data || [])
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchBills() }, [])

  const handlePayment = async (billId: number) => {
    setSubmitting(true)
    try {
      await billingService.processPayment(billId, paymentForm)
      setShowPayment(null)
      setPaymentForm({ paymentMethod: 'CASH', paymentAmount: 0, reference: '' })
      fetchBills()
    } catch { /* empty */ } finally { setSubmitting(false) }
  }

  const handleDownloadPdf = async (id: number) => {
    try {
      const blob = await billingService.downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `bill-${id}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { /* empty */ }
  }

  const statusColor = (s: string) => {
    if (s === 'PAID') return 'status-badge success'
    if (s === 'PARTIAL') return 'status-badge warning'
    if (s === 'REFUNDED') return 'status-badge info'
    return 'status-badge danger'
  }

  return (
    <DashboardLayout title="Billing">
      <Card>
        <CardHeader><CardTitle className="text-sm">All Bills</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>BILL #</th><th>PATIENT</th><th>TREATMENT</th><th>TOTAL</th><th>PAID</th><th>BALANCE</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b.id}>
                      <td className="font-mono text-xs">{b.billNumber}</td>
                      <td className="font-medium">{b.appointment?.patient?.firstName} {b.appointment?.patient?.lastName}</td>
                      <td>{b.appointment?.treatment?.treatmentName}</td>
                      <td>LKR {b.totalAmount?.toLocaleString()}</td>
                      <td>LKR {b.amountPaid?.toLocaleString()}</td>
                      <td>LKR {b.balance?.toLocaleString()}</td>
                      <td><span className={statusColor(b.billStatus)}>{b.billStatus}</span></td>
                      <td className="flex gap-1">
                        {b.billStatus !== 'PAID' && (
                          <button onClick={() => { setShowPayment(b.id); setPaymentForm({ ...paymentForm, paymentAmount: b.balance }) }} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Process Payment"><CreditCard className="size-4" /></button>
                        )}
                        <button onClick={() => handleDownloadPdf(b.id)} className="rounded p-1 text-muted-foreground hover:bg-accent" title="Download PDF"><Download className="size-4" /></button>
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

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="text-sm">Process Payment</CardTitle><button onClick={() => setShowPayment(null)}><X className="size-4" /></button></CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as typeof paymentForm.paymentMethod })} className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="CASH">Cash</option><option value="CARD">Card</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="MOBILE">Mobile</option>
                </select>
                <input type="number" placeholder="Amount" value={paymentForm.paymentAmount || ''} onChange={e => setPaymentForm({ ...paymentForm, paymentAmount: parseFloat(e.target.value) || 0 })} className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <input placeholder="Reference" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPayment(null)}>Cancel</Button>
                  <Button onClick={() => handlePayment(showPayment)} disabled={submitting}>{submitting ? 'Processing...' : 'Submit Payment'}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
