import { api } from '@/lib/api'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { MenuSection } from './menu-section'

interface Props {
  params: Promise<{ foodCourtSlug: string; tableNumber: string; merchantId: string }>
}

export default async function MerchantMenuPage({ params }: Props) {
  const { foodCourtSlug, tableNumber, merchantId } = await params
  const [menuItems, categories] = await Promise.all([
    api.getMerchantMenu(merchantId),
    api.getMerchantCategories(merchantId),
  ])

  const storeName = menuItems.length > 0 && menuItems[0]?.merchant?.storeName
    ? menuItems[0].merchant.storeName
    : 'Store'

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 glass border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/order/${foodCourtSlug}/${tableNumber}`}
            className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold truncate">{storeName}</h1>
              <p className="text-xs text-gray-400">Menu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {categories.map((category: any) => {
          const items = menuItems.filter((item: any) => item.categoryId === category.id)
          if (items.length === 0) return null

          return (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  {category.name}
                </h2>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((item: any) => (
                  <MenuSection
                    key={item.id}
                    item={item}
                    merchantId={merchantId}
                    merchantName={category.name}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {categories.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">No menu items yet</p>
            <p className="text-gray-300 text-sm mt-1">This store is setting up their menu</p>
          </div>
        )}
      </div>
    </div>
  )
}
