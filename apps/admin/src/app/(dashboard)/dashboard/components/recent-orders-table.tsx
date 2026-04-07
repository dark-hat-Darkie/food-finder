import { Clock } from 'lucide-react'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  PREPARING: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400' },
  READY: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  DELIVERED: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
}

interface RecentOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number | string
  createdAt: string
  merchant: { storeName: string }
  orderTable: { number: number }
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 text-sm">No recent orders</p>
      </div>
    )
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="space-y-1">
      {orders.map((order) => {
        const style = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING
        return (
          <div
            key={order.id}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-500">
                  #{order.orderTable?.number || '?'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {order.merchant?.storeName || 'Unknown'}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              <span className="text-sm font-bold text-slate-800">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
              <span className={`badge text-[10px] ${style.bg} ${style.text}`}>
                <span className={`w-1 h-1 rounded-full ${style.dot} mr-1`} />
                {order.status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
