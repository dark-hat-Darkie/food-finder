'use client'

import { useCartStore } from '@/store/cart-store'
import { useOrderHistoryStore } from '@/store/order-history-store'
import { api } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft, Store, MessageSquare, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const merchantId = useCartStore((s) => s.merchantId)
  const merchantName = useCartStore((s) => s.merchantName)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const total = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0))
  const addOrderToHistory = useOrderHistoryStore((s) => s.addOrder)
  const router = useRouter()
  const pathname = usePathname()
  const [note, setNote] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const basePath = pathname.replace('/cart', '')

  const handlePlaceOrder = async () => {
    if (!merchantId || items.length === 0) return

    if (!phone.trim()) {
      setError('Please enter your phone number.')
      return
    }

    const parts = pathname.split('/').filter(Boolean)
    const foodCourtSlug = parts[1]
    const tableNumber = parts[2]

    setLoading(true)
    setError('')

    try {
      const foodCourt = await api.getFoodCourtBySlug(foodCourtSlug)
      const table = foodCourt.tables?.find((t: any) => t.number === Number(tableNumber))

      if (!table) {
        setError('Table not found. Please scan the QR code again.')
        return
      }

      const order = await api.createOrder({
        tableId: table.id,
        foodCourtId: foodCourt.id,
        merchantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        customerNote: note || undefined,
        customerPhone: phone.trim(),
      })

      addOrderToHistory({
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        merchantName: merchantName || '',
        totalAmount: total,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        foodCourtSlug,
        tableNumber,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      })

      clearCart()
      router.push(`${basePath}/order/${order.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-36">
      <div className="sticky top-0 z-40 glass border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Your Cart</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {merchantName && (
          <div className="flex items-center gap-2 mb-5 px-1">
            <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-primary-600" />
            </div>
            <p className="text-sm text-gray-500">
              From <span className="font-semibold text-gray-700">{merchantName}</span>
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-24 animate-fade-in-up">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">🛒</span>
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-1">Your cart is empty</p>
            <p className="text-gray-400 text-sm mb-6">Add items from the menu to get started</p>
            <Link
              href={basePath}
              className="inline-flex items-center gap-2 text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.menuItemId} className="card animate-fade-in-up">
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{item.name}</h3>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-8 h-8 rounded-xl bg-primary-50 hover:bg-primary-100 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-primary-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 animate-fade-in-up stagger-2">
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-300" />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note for the kitchen..."
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="mt-3 animate-fade-in-up stagger-3">
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number *"
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all placeholder:text-gray-300"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 px-1">Required so we can contact you about your order</p>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-2xl animate-scale-in">
            {error}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto animate-slide-up">
          <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100 px-5 pt-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Placing Order...
                </span>
              ) : (
                `Place Order \u00B7 $${total.toFixed(2)}`
              )}
            </button>
            <p className="text-xs text-center text-gray-400 mt-2.5">Cash on delivery</p>
          </div>
        </div>
      )}
    </div>
  )
}
