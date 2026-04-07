'use client'

import { useState } from 'react'
import { PackageOpen } from 'lucide-react'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  PREPARING: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  READY: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  DELIVERED: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

export function OrdersList({ initialData }: { initialData: any }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [orders, setOrders] = useState(initialData?.data || [])
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const filterOrders = async (status: string) => {
    setStatusFilter(status)
    const params = status ? `?status=${status}` : ''
    const res = await fetch(`${apiBase}/orders${params}`)
    const data = await res.json()
    setOrders(data.data || [])
  }

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`${apiBase}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders(orders.map((o: any) => (o.id === orderId ? { ...o, status } : o)))
  }

  const ACTION_MAP: Record<string, { label: string; status: string; color: string }> = {
    PENDING: { label: 'Accept', status: 'ACCEPTED', color: 'text-blue-600 hover:bg-blue-50 border-blue-200' },
    ACCEPTED: { label: 'Start Prep', status: 'PREPARING', color: 'text-orange-600 hover:bg-orange-50 border-orange-200' },
    PREPARING: { label: 'Mark Ready', status: 'READY', color: 'text-emerald-600 hover:bg-emerald-50 border-emerald-200' },
    READY: { label: 'Delivered', status: 'DELIVERED', color: 'text-slate-600 hover:bg-slate-50 border-slate-200' },
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map(
          (status) => (
            <button
              key={status}
              onClick={() => filterOrders(status)}
              data-active={statusFilter === status}
              className="filter-pill bg-slate-100 text-slate-600"
            >
              {status || 'All'}
            </button>
          )
        )}
      </div>

      <div className="card overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-16 text-center">
            <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No orders found</p>
            <p className="text-slate-300 text-sm mt-1">Orders will appear here when placed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Store</th>
                  <th>Table</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const style = STATUS_STYLES[order.status] || STATUS_STYLES.DELIVERED
                  const action = ACTION_MAP[order.status]
                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          #{order.orderNumber?.slice(-8)}
                        </span>
                      </td>
                      <td className="font-medium text-slate-800">{order.merchant?.storeName || '-'}</td>
                      <td className="text-slate-500">#{order.table?.number}</td>
                      <td>
                        <span className="font-semibold text-slate-800">${Number(order.totalAmount).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={`badge ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} mr-1.5`} />
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {action && (
                          <button
                            onClick={() => updateStatus(order.id, action.status)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ${action.color}`}
                          >
                            {action.label}
                          </button>
                        )}
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
