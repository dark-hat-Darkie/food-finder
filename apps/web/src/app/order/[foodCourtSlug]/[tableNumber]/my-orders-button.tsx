'use client'

import { useOrderHistoryStore } from '@/store/order-history-store'
import { Receipt } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  foodCourtSlug: string
  tableNumber: string
}

export function MyOrdersButton({ foodCourtSlug, tableNumber }: Props) {
  const [mounted, setMounted] = useState(false)
  const orders = useOrderHistoryStore((s) => s.orders)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const count = orders.filter(
    (o) => o.foodCourtSlug === foodCourtSlug && o.tableNumber === tableNumber
  ).length

  if (count === 0) return null

  return (
    <Link
      href={`${pathname}/my-orders`}
      className="inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2.5 hover:shadow-md transition-all active:scale-[0.98]"
    >
      <Receipt className="w-4 h-4 text-primary-500" />
      <span className="text-sm font-semibold text-gray-900">My Orders</span>
      <span className="text-xs font-bold text-white bg-primary-500 rounded-full w-5 h-5 flex items-center justify-center">
        {count}
      </span>
    </Link>
  )
}
