import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  imageUrl?: string
}

interface CartState {
  items: CartItem[]
  merchantId: string | null
  merchantName: string | null
  addItem: (item: CartItem, merchantId: string, merchantName: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      merchantId: null,
      merchantName: null,

      addItem: (item, merchantId, merchantName) => {
        const state = get()
        if (state.merchantId && state.merchantId !== merchantId) {
          if (!confirm('Your cart has items from another store. Clear cart and add this item?')) {
            return
          }
          set({ items: [{ ...item }], merchantId, merchantName })
          return
        }

        const existing = state.items.find((i) => i.menuItemId === item.menuItemId)
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.menuItemId === item.menuItemId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            merchantId,
            merchantName,
          })
        } else {
          set({ items: [...state.items, { ...item }], merchantId, merchantName })
        }
      },

      removeItem: (menuItemId) => {
        const state = get()
        const items = state.items.filter((i) => i.menuItemId !== menuItemId)
        set({ items, merchantId: items.length ? state.merchantId : null, merchantName: items.length ? state.merchantName : null })
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [], merchantId: null, merchantName: null }),

      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'food-finder-cart' }
  )
)
