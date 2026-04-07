'use client'

import { useOrderHistoryStore } from '@/store/order-history-store'
import { api } from '@/lib/api'
import { ArrowLeft, Receipt, Clock, ChevronRight, Package, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  ACCEPTED: { label: 'Accepted', color: 'text-blue-600', bg: 'bg-blue-50' },
  PREPARING: { label: 'Preparing', color: 'text-primary-600', bg: 'bg-primary-50' },
  READY: { label: 'Ready', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-50' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
}

export default function MyOrdersPage() {
  const savedOrders = useOrderHistoryStore((s) => s.orders)
  const pathname = usePathname()
  const basePath = pathname.replace('/my-orders', '')
  const parts = pathname.split('/').filter(Boolean)
  const foodCourtSlug = parts[1]
  const tableNumber = parts[2]

  const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const relevantOrders = savedOrders.filter(
      (o) => o.foodCourtSlug === foodCourtSlug && o.tableNumber === tableNumber
    )

    Promise.allSettled(
      relevantOrders.map(async (order) => {
        try {
          const data = await api.getOrder(order.orderId)
          return { orderId: order.orderId, status: data.status }
        } catch {
          return { orderId: order.orderId, status: order.status }
        }
      })
    ).then((results) => {
      const statuses: Record<string, string> = {}
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          statuses[result.value.orderId] = result.value.status
        }
      })
      setLiveStatuses(statuses)
    })
  }, [mounted, savedOrders, foodCourtSlug, tableNumber])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  const relevantOrders = savedOrders.filter(
    (o) => o.foodCourtSlug === foodCourtSlug && o.tableNumber === tableNumber
  )

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {relevantOrders.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Receipt className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-1">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">Your order history will appear here</p>
            <Link
              href={basePath}
              className="inline-flex items-center gap-2 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {relevantOrders.map((order, index) => {
              const status = liveStatuses[order.orderId] || order.status
              const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
              const timeAgo = getTimeAgo(order.createdAt)

              return (
                <Link
                  key={order.orderId}
                  href={`${basePath}/order/${order.orderId}`}
                  className={`card card-hover flex items-center gap-4 animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
                >
                  <div className={`w-12 h-12 ${statusConfig.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    {status === 'CANCELLED' ? (
                      <X className={`w-5 h-5 ${statusConfig.color}`} />
                    ) : status === 'DELIVERED' ? (
                      <Package className={`w-5 h-5 ${statusConfig.color}`} />
                    ) : (
                      <Receipt className={`w-5 h-5 ${statusConfig.color}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {order.merchantName}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-xs text-gray-300">&middot;</span>
                      <span className="text-xs font-semibold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-gray-400">{timeAgo}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString()
}
