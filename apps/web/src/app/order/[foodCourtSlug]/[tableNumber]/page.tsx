import { api } from '@/lib/api'
import { Store, MapPin, Hash, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { MyOrdersButton } from './my-orders-button'

interface Props {
  params: Promise<{ foodCourtSlug: string; tableNumber: string }>
}

export default async function FoodCourtPage({ params }: Props) {
  const { foodCourtSlug, tableNumber } = await params
  const foodCourt = await api.getFoodCourtBySlug(foodCourtSlug)

  return (
    <div className="min-h-screen pb-24">
      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white px-5 pt-12 pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-surface rounded-t-[24px]" />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight">{foodCourt.name}</h1>
          {foodCourt.address && (
            <div className="flex items-center gap-1.5 mt-2 text-primary-100">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <p className="text-sm">{foodCourt.address}</p>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1.5 text-primary-100">
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <p className="text-sm">Table {tableNumber}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-semibold text-gray-900">Choose a Store</h2>
          <MyOrdersButton foodCourtSlug={foodCourtSlug} tableNumber={tableNumber} />
        </div>
        <div className="space-y-3">
          {foodCourt.merchants?.map((merchant: any, index: number) => (
            <Link
              key={merchant.id}
              href={`/order/${foodCourtSlug}/${tableNumber}/merchant/${merchant.id}`}
              className={`card card-hover flex items-center gap-4 animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                {merchant.logoUrl ? (
                  <img
                    src={merchant.logoUrl}
                    alt={merchant.storeName}
                    className="w-14 h-14 rounded-2xl object-cover"
                  />
                ) : (
                  <Store className="w-6 h-6 text-primary-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{merchant.storeName}</h3>
                {merchant.description && (
                  <p className="text-sm text-gray-400 truncate mt-0.5">{merchant.description}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                    {merchant._count?.menuItems || 0} items
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>

        {(!foodCourt.merchants || foodCourt.merchants.length === 0) && (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No stores available</p>
            <p className="text-gray-300 text-sm mt-1">Check back later</p>
          </div>
        )}
      </div>
    </div>
  )
}
