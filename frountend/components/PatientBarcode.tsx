'use client'

import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

interface PatientBarcodeProps {
  patientNumber: string
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  className?: string
}

export default function PatientBarcode({
  patientNumber,
  width = 1.5,
  height = 50,
  displayValue = true,
  fontSize = 14,
  className = '',
}: PatientBarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && patientNumber) {
      try {
        JsBarcode(svgRef.current, patientNumber, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          font: 'monospace',
          textMargin: 4,
          margin: 4,
          background: '#ffffff',
          lineColor: '#000000',
        })
      } catch {
        // invalid input
      }
    }
  }, [patientNumber, width, height, displayValue, fontSize])

  return <svg ref={svgRef} className={className} />
}
