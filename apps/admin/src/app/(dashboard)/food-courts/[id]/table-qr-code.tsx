'use client'

import { useState, useEffect } from 'react'
import { Download, QrCode } from 'lucide-react'
import QRCode from 'qrcode'

export function TableQrCode({
  tableId,
  tableNumber,
  qrCodeUrl,
  onGenerated,
}: {
  tableId: string
  tableNumber: number
  foodCourtId: string
  qrCodeUrl?: string | null
  onGenerated?: (dataUrl: string) => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (qrCodeUrl) {
      QRCode.toDataURL(qrCodeUrl, { width: 512, margin: 2 }).then(setQrDataUrl)
    }
  }, [qrCodeUrl])

  const generateQr = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/qrcodes/generate/${tableId}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setQrDataUrl(data.qrDataUrl)
        onGenerated?.(data.qrDataUrl)
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `table-${tableNumber}-qr.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center animate-pulse">
        <QrCode className="w-6 h-6 text-slate-300" />
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200">
          <QrCode className="w-6 h-6 text-slate-300" />
        </div>
        <button
          onClick={generateQr}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Generate QR
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={qrDataUrl}
        alt={`QR Code for Table ${tableNumber}`}
        className="w-16 h-16 rounded-xl ring-1 ring-slate-200"
      />
      <button
        onClick={downloadQr}
        className="action-btn text-blue-600"
        title="Download QR Code"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}
