import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SavedOrder {
  orderId: string
  orderNumber: string
  merchantName: string
  totalAmount: number
  status: string
  createdAt: string
  foodCourtSlug: string
  tableNumber: string
  itemCount: number
}

interface OrderHistoryState {
  orders: SavedOrder[]
  addOrder: (order: SavedOrder) => void
  removeOrder: (orderId: string) => void
  clearHistory: () => void
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        const existing = get().orders.find((o) => o.orderId === order.orderId)
        if (existing) return
        set({ orders: [order, ...get().orders] })
      },

      removeOrder: (orderId) => {
        set({ orders: get().orders.filter((o) => o.orderId !== orderId) })
      },

      clearHistory: () => set({ orders: [] }),
    }),
    { name: 'food-finder-order-history' }
  )
)
