'use client'

import { useCartStore } from '@/store/cart-store'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function CartFab() {
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (count === 0 || pathname.endsWith('/cart') || pathname.includes('/order/ORD-')) return null

  const cartPath = pathname.split('/merchant/')[0] + '/cart'

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div className="relative">
        <Link
          href={cartPath}
          className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary-500/40 active:scale-95 transition-all duration-200"
        >
          <ShoppingCart className="w-6 h-6" />
        </Link>
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-white text-primary-600 text-xs w-5.5 h-5.5 min-w-[22px] rounded-full flex items-center justify-center font-bold shadow-sm border border-primary-100">
            {count}
          </span>
        )}
      </div>
    </div>
  )
}
