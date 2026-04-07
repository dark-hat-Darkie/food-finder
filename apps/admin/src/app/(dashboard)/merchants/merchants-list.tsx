'use client'

import { useState } from 'react'
import { Search, Check, X, ToggleLeft, ToggleRight, Store } from 'lucide-react'

export function MerchantsList({ initialData }: { initialData: any }) {
  const [search, setSearch] = useState('')
  const [merchants, setMerchants] = useState(initialData?.data || [])
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

  const handleSearch = async () => {
    const res = await fetch(`${apiBase}/merchants?search=${search}`)
    const data = await res.json()
    setMerchants(data.data || [])
  }

  const approveMerchant = async (id: string) => {
    await fetch(`${apiBase}/merchants/${id}/approve`, { method: 'PATCH' })
    setMerchants(merchants.map((m: any) => (m.id === id ? { ...m, isApproved: true, isActive: true } : m)))
  }

  const rejectMerchant = async (id: string) => {
    await fetch(`${apiBase}/merchants/${id}/reject`, { method: 'PATCH' })
    setMerchants(merchants.map((m: any) => (m.id === id ? { ...m, isApproved: false, isActive: false } : m)))
  }

  const toggleActive = async (id: string) => {
    await fetch(`${apiBase}/merchants/${id}/toggle-active`, { method: 'PATCH' })
    setMerchants(merchants.map((m: any) => (m.id === id ? { ...m, isActive: !m.isActive } : m)))
  }

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search merchants..."
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {merchants.length === 0 ? (
          <div className="p-16 text-center">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No merchants found</p>
            <p className="text-slate-300 text-sm mt-1">Merchant applications will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Store</th>
                  <th>Owner</th>
                  <th>Food Court</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((merchant: any) => (
                  <tr key={merchant.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                          <Store className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{merchant.storeName}</p>
                          <p className="text-xs text-slate-400">{merchant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600">{merchant.ownerName}</td>
                    <td className="text-slate-500">{merchant.foodCourt?.name || '-'}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <span className={`badge ${merchant.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${merchant.isApproved ? 'bg-emerald-400' : 'bg-amber-400'} mr-1.5`} />
                          {merchant.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <span className={`badge ${merchant.isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>
                          {merchant.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {!merchant.isApproved && (
                          <>
                            <button
                              onClick={() => approveMerchant(merchant.id)}
                              className="action-btn text-emerald-600"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectMerchant(merchant.id)}
                              className="action-btn text-red-500"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => toggleActive(merchant.id)}
                          className="action-btn"
                          title={merchant.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {merchant.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
