'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { CheckCircle, Clock, ChefHat, UtensilsCrossed, XCircle, ArrowLeft, Receipt, Ban } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', description: 'Waiting for the store to accept', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'ACCEPTED', label: 'Accepted', description: 'The store has accepted your order', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'PREPARING', label: 'Preparing', description: 'Your food is being prepared', icon: ChefHat, color: 'text-primary-500', bg: 'bg-primary-50' },
  { key: 'READY', label: 'Ready for Pickup', description: 'Your order is ready!', icon: UtensilsCrossed, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'DELIVERED', label: 'Delivered', description: 'Enjoy your meal!', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
]

export default function OrderTrackingPage({ params }: { params: Promise<{ orderId: string; foodCourtSlug: string; tableNumber: string }> }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tableNum, setTableNum] = useState<string>('')
  const [cancelling, setCancelling] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    params.then(async ({ orderId, tableNumber }) => {
      setTableNum(tableNumber)
      try {
        const data = await api.getOrder(orderId)
        setOrder(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })
  }, [params])

  useEffect(() => {
    if (!order) return

    const socket = getSocket()
    socket.connect()
    socket.emit('join-order', order.id)

    socket.on('order-status-changed', (data: any) => {
      setOrder((prev: any) => (prev ? { ...prev, ...data.order, status: data.status } : prev))
    })

    return () => {
      socket.emit('leave-order', order.id)
      socket.disconnect()
    }
  }, [order?.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
          <Receipt className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">Order not found</p>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'CANCELLED'
  const canCancel = order.status === 'PENDING'
  const basePath = pathname.split('/order/')[0] + '/order/' + pathname.split('/order/')[1].split('/')[0] + '/' + pathname.split('/order/')[1].split('/')[1]

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await api.updateOrderStatus(order.id, 'CANCELLED')
      setOrder((prev: any) => (prev ? { ...prev, status: 'CANCELLED' } : prev))
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={basePath} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Order #{order.orderNumber?.slice(-8)}</h1>
            <p className="text-xs text-gray-400">{order.merchant?.storeName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {isCancelled ? (
          <div className="card text-center py-10 animate-scale-in">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-red-600">Order Cancelled</h2>
            <p className="text-gray-400 text-sm mt-1">This order has been cancelled by the store.</p>
          </div>
        ) : (
          <div className="card mb-4 animate-fade-in-up">
            <h2 className="font-semibold text-gray-900 mb-5">Order Status</h2>
            <div className="relative">
              {STATUS_STEPS.map((step, index) => {
                const isActive = index <= currentStepIndex
                const isCurrent = index === currentStepIndex
                const Icon = step.icon
                const isLast = index === STATUS_STEPS.length - 1

                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isActive ? step.bg : 'bg-gray-50'
                        } ${isCurrent ? 'ring-2 ring-offset-2 ring-primary-200' : ''}`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-300'}`} />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-10 transition-colors duration-500 ${
                            index < currentStepIndex ? 'bg-primary-300' : 'bg-gray-100'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isActive ? 'text-gray-400' : 'text-gray-200'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="card mb-4 animate-fade-in-up stagger-2">
          <h2 className="font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-3">
            {order.orderItems?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                    {item.quantity}x
                  </span>
                  <span className="text-sm text-gray-700">{item.menuItem?.name || 'Item'}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">${Number(item.totalPrice).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-100 pt-3 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {order.customerNote && (
          <div className="card mb-4 animate-fade-in-up stagger-3">
            <h2 className="font-semibold text-gray-900 mb-2">Note</h2>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-3">{order.customerNote}</p>
          </div>
        )}

        <div className="card animate-fade-in-up stagger-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Payment</p>
              <p className="text-sm font-semibold text-gray-700">Cash</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Table</p>
              <p className="text-sm font-semibold text-gray-700">#{order.table?.number ?? tableNum}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-gray-700">{order.customerPhone}</p>
            </div>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-100 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {cancelling ? (
              <>
                <span className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <Ban className="w-4 h-4" />
                Cancel Order
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
