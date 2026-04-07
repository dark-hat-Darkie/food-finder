'use client'

import { useState } from 'react'
import { Check, CircleDollarSign } from 'lucide-react'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  APPROVED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  PAID: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

export function PaymentsList({ initialData }: { initialData: any }) {
  const [payments, setPayments] = useState(initialData?.data || [])
  const [statusFilter, setStatusFilter] = useState('')
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const filterPayments = async (status: string) => {
    setStatusFilter(status)
    const params = status ? `?status=${status}` : ''
    const res = await fetch(`${apiBase}/merchant-payments${params}`)
    const data = await res.json()
    setPayments(data.data || [])
  }

  const markPaid = async (id: string) => {
    const ref = prompt('Enter bank reference number:')
    if (!ref) return
    await fetch(`${apiBase}/merchant-payments/${id}/mark-paid`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referenceNumber: ref }),
    })
    setPayments(payments.map((p: any) => (p.id === id ? { ...p, status: 'PAID', referenceNumber: ref } : p)))
  }

  const approvePayment = async (id: string) => {
    await fetch(`${apiBase}/merchant-payments/${id}/approve`, { method: 'PATCH' })
    setPayments(payments.map((p: any) => (p.id === id ? { ...p, status: 'APPROVED' } : p)))
  }

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => filterPayments(status)}
            data-active={statusFilter === status}
            className="filter-pill bg-slate-100 text-slate-600"
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-16 text-center">
            <CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No payments found</p>
            <p className="text-slate-300 text-sm mt-1">Payment records will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Period</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => {
                  const style = STATUS_STYLES[payment.status] || STATUS_STYLES.PENDING
                  return (
                    <tr key={payment.id}>
                      <td className="font-medium text-slate-800">{payment.merchant?.storeName || '-'}</td>
                      <td>
                        <span className="font-bold text-slate-800">${Number(payment.amount).toFixed(2)}</span>
                      </td>
                      <td className="text-xs text-slate-400">
                        {new Date(payment.periodStart).toLocaleDateString()} &mdash;{' '}
                        {new Date(payment.periodEnd).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          {payment.referenceNumber || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`} />
                          {payment.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {payment.status === 'PENDING' && (
                            <button
                              onClick={() => approvePayment(payment.id)}
                              className="action-btn text-blue-600"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(payment.status === 'PENDING' || payment.status === 'APPROVED') && (
                            <button
                              onClick={() => markPaid(payment.id)}
                              className="action-btn text-emerald-600"
                              title="Mark as Paid"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
