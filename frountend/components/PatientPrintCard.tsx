'use client'

import { useRef, useEffect } from 'react'
import lottie from 'lottie-web'
import printerAnimation from '@/public/Printer.json'
import PatientBarcode from './PatientBarcode'
import type { PatientResponse } from '@/types/patient.types'

interface PatientPrintCardProps {
  patient: PatientResponse
  onClose: () => void
}

export default function PatientPrintCard({ patient, onClose }: PatientPrintCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const animContainerRef = useRef<HTMLDivElement>(null)
  const animInstanceRef = useRef<lottie.AnimationItem | null>(null)

  useEffect(() => {
    if (animContainerRef.current) {
      animInstanceRef.current = lottie.loadAnimation({
        container: animContainerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: printerAnimation,
      })
    }
    return () => {
      animInstanceRef.current?.destroy()
    }
  }, [])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Patient ID - ${patient.patientNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
          .card { width: 340px; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); overflow: hidden; border: 2px solid #173f47; }
          .card-header { background: linear-gradient(135deg, #173f47, #167d84); color: #fff; padding: 16px 20px; text-align: center; }
          .card-header h2 { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
          .card-header p { font-size: 10px; opacity: 0.8; }
          .card-body { padding: 20px; }
          .barcode-container { text-align: center; margin: 12px 0; }
          .barcode-container svg { max-width: 100%; }
          .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 12px; font-weight: 600; color: #1a1a2e; text-align: right; }
          .card-footer { background: #f8f9fa; padding: 12px 20px; text-align: center; border-top: 1px solid #e0e0e0; }
          .card-footer p { font-size: 9px; color: #888; }
          @media print {
            body { background: none; min-height: auto; }
            .card { box-shadow: none; border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="card-header">
            <h2>DentaFlow Dental Clinic</h2>
            <p>Patient Identification Card</p>
          </div>
          <div class="card-body">
            <div class="barcode-container">
              <svg id="barcode"></svg>
            </div>
            <div class="info-row">
              <span class="info-label">Patient No</span>
              <span class="info-value">${patient.patientNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">${patient.firstName} ${patient.lastName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact</span>
              <span class="info-value">${patient.contactNumber || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Gender</span>
              <span class="info-value">${patient.gender || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date of Birth</span>
              <span class="info-value">${patient.dateOfBirth || 'N/A'}</span>
            </div>
          </div>
          <div class="card-footer">
            <p>Scan barcode for quick identification</p>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
        <script>
          JsBarcode("#barcode", "${patient.patientNumber}", {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 16,
            font: "monospace",
            textMargin: 6,
            margin: 8
          });
          window.onload = function() { window.print(); }
        <\/script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-background rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()} ref={cardRef}>
          <div className="bg-gradient-to-br from-[#173f47] to-[#167d84] text-white p-5 text-center">
            <h2 className="text-lg font-bold">DentaFlow Dental Clinic</h2>
            <p className="text-xs opacity-80 mt-1">Patient Identification Card</p>
          </div>
          <div className="p-5">
            <div className="flex justify-center mb-2">
              <div ref={animContainerRef} style={{ height: 120, width: 120 }} />
            </div>
            <div className="flex justify-center mb-4">
              <PatientBarcode patientNumber={patient.patientNumber} width={2} height={60} fontSize={16} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Patient No</span>
                <span className="text-sm font-semibold font-mono">{patient.patientNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Name</span>
                <span className="text-sm font-semibold">{patient.firstName} {patient.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Contact</span>
                <span className="text-sm font-medium">{patient.contactNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Gender</span>
                <span className="text-sm font-medium">{patient.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</span>
                <span className="text-sm font-medium">{patient.dateOfBirth || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 px-5 py-3 text-center border-t border-border">
            <p className="text-xs text-muted-foreground">Scan barcode for quick identification</p>
          </div>
          <div className="flex gap-2 p-4 border-t border-border">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">Close</button>
            <button onClick={handlePrint} className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Print Card</button>
          </div>
        </div>
      </div>
    </>
  )
}
