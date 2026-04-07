'use client'

import { useCartStore } from '@/store/cart-store'
import { Plus, Clock, Check } from 'lucide-react'
import { useState } from 'react'

export function MenuSection({ item, merchantId, merchantName }: { item: any; merchantId: string; merchantName: string }) {
  const addItem = useCartStore((s) => s.addItem)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: 1,
        imageUrl: item.imageUrl,
      },
      merchantId,
      merchantName
    )
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 800)
  }

  if (!item.isAvailable) {
    return (
      <div className="card opacity-50">
        <div className="flex items-start gap-3">
          {item.imageUrl && (
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover grayscale" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
            )}
            <p className="text-sm font-semibold text-gray-400 mt-1.5">${Number(item.price).toFixed(2)}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-medium shrink-0">
            Sold out
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="card card-hover">
      <div className="flex items-start gap-3">
        {item.imageUrl && (
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm font-bold text-gray-900">${Number(item.price).toFixed(2)}</p>
            {item.prepTime && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {item.prepTime} min
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleAdd}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
            justAdded
              ? 'bg-green-500 text-white scale-110'
              : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm shadow-primary-500/20 hover:shadow-md hover:shadow-primary-500/30 active:scale-95'
          }`}
        >
          {justAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
