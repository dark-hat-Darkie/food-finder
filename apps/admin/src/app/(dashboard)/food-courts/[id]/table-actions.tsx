'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, QrCode, Download, Loader2, Check } from 'lucide-react'

export function TableActions({ foodCourtId, tableCount }: { foodCourtId: string; tableCount: number }) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [generatingSingle, setGeneratingSingle] = useState(false)

  const addTable = async () => {
    setGeneratingSingle(true)
    try {
      const res = await fetch(`/api/food-courts/${foodCourtId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: tableCount + 1 }),
      })
      if (res.ok) router.refresh()
    } finally {
      setGeneratingSingle(false)
    }
  }

  const generateQrCodes = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/qrcodes/generate-court/${foodCourtId}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        router.refresh()
      }
    } finally {
      setGenerating(false)
    }
  }

  const downloadQrCodes = async () => {
    setDownloading(true)
    try {
      const res = await fetch(`/api/qrcodes/generate-court/${foodCourtId}`, { method: 'POST' })
      if (res.ok) {
        const codes = await res.json()
        for (const code of codes) {
          if (code.qrDataUrl) {
            const link = document.createElement('a')
            link.href = code.qrDataUrl
            link.download = `table-${code.tableNumber}-qr.png`
            link.click()
            await new Promise((r) => setTimeout(r, 200))
          }
        }
      }
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={addTable}
        disabled={generatingSingle}
        className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3.5"
      >
        {generatingSingle ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        Add Table
      </button>
      <button
        onClick={generateQrCodes}
        disabled={generating}
        className="btn-primary flex items-center gap-1.5 text-xs py-2 px-3.5"
      >
        {generating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <QrCode className="w-3.5 h-3.5" />
        )}
        Generate QR
      </button>
      {tableCount > 0 && (
        <button
          onClick={downloadQrCodes}
          disabled={downloading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3.5 rounded-xl transition-all duration-200 text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Download All
        </button>
      )}
    </div>
  )
}
