import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export async function getApi(token?: string) {
  const session = await getServerSession(authOptions)
  const accessToken = token || (session as any)?.accessToken

  async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${res.status}`)
    }

    return res.json()
  }

  return {
    getDashboardStats: () => fetchApi<any>('/orders/stats/dashboard'),
    getRevenueTrend: (days?: number) => fetchApi<any[]>(`/orders/stats/revenue-trend?days=${days || 7}`),
    getOrderStatusDistribution: () => fetchApi<any[]>('/orders/stats/status-distribution'),
    getTopMerchants: (limit?: number) => fetchApi<any[]>(`/orders/stats/top-merchants?limit=${limit || 5}`),
    getRecentOrders: (limit?: number) => fetchApi<any[]>(`/orders/stats/recent-orders?limit=${limit || 10}`),
    getHourlyOrders: () => fetchApi<any[]>('/orders/stats/hourly-orders'),
    getFoodCourtPerformance: () => fetchApi<any[]>('/orders/stats/food-court-performance'),
    getFoodCourts: () => fetchApi<any[]>('/food-courts'),
    getFoodCourt: (id: string) => fetchApi<any>(`/food-courts/${id}`),
    createFoodCourt: (data: any) =>
      fetchApi<any>('/food-courts', { method: 'POST', body: JSON.stringify(data) }),
    updateFoodCourt: (id: string, data: any) =>
      fetchApi<any>(`/food-courts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteFoodCourt: (id: string) =>
      fetchApi<any>(`/food-courts/${id}`, { method: 'DELETE' }),
    getTables: (foodCourtId: string) => fetchApi<any[]>(`/food-courts/${foodCourtId}/tables`),
    createTable: (foodCourtId: string, number: number) =>
      fetchApi<any>(`/food-courts/${foodCourtId}/tables`, {
        method: 'POST',
        body: JSON.stringify({ number }),
      }),
    deleteTable: (foodCourtId: string, tableId: string) =>
      fetchApi<any>(`/food-courts/${foodCourtId}/tables/${tableId}`, { method: 'DELETE' }),
    generateQrForTable: (tableId: string) =>
      fetchApi<any>(`/qrcodes/generate/${tableId}`, { method: 'POST' }),
    generateQrForCourt: (foodCourtId: string) =>
      fetchApi<any>(`/qrcodes/generate-court/${foodCourtId}`, { method: 'POST' }),
    getMerchants: (page?: number, limit?: number, search?: string) => {
      const params = new URLSearchParams()
      if (page) params.set('page', String(page))
      if (limit) params.set('limit', String(limit))
      if (search) params.set('search', search)
      return fetchApi<any>(`/merchants?${params.toString()}`)
    },
    getMerchant: (id: string) => fetchApi<any>(`/merchants/${id}`),
    approveMerchant: (id: string) =>
      fetchApi<any>(`/merchants/${id}/approve`, { method: 'PATCH' }),
    rejectMerchant: (id: string) =>
      fetchApi<any>(`/merchants/${id}/reject`, { method: 'PATCH' }),
    toggleMerchantActive: (id: string) =>
      fetchApi<any>(`/merchants/${id}/toggle-active`, { method: 'PATCH' }),
    getOrders: (page?: number, limit?: number, filters?: Record<string, string>) => {
      const params = new URLSearchParams()
      if (page) params.set('page', String(page))
      if (limit) params.set('limit', String(limit))
      if (filters) Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      return fetchApi<any>(`/orders?${params.toString()}`)
    },
    getOrder: (id: string) => fetchApi<any>(`/orders/${id}`),
    updateOrderStatus: (id: string, status: string) =>
      fetchApi<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getPayments: (page?: number, limit?: number, status?: string) => {
      const params = new URLSearchParams()
      if (page) params.set('page', String(page))
      if (limit) params.set('limit', String(limit))
      if (status) params.set('status', status)
      return fetchApi<any>(`/merchant-payments?${params.toString()}`)
    },
    createPayment: (data: any) =>
      fetchApi<any>('/merchant-payments', { method: 'POST', body: JSON.stringify(data) }),
    markPaymentPaid: (id: string, data?: any) =>
      fetchApi<any>(`/merchant-payments/${id}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify(data || {}),
      }),
    approvePayment: (id: string) =>
      fetchApi<any>(`/merchant-payments/${id}/approve`, { method: 'PATCH' }),
    rejectPayment: (id: string) =>
      fetchApi<any>(`/merchant-payments/${id}/reject`, { method: 'PATCH' }),
  }
}

export function getApiClient(token: string) {
  return getApi(token)
}
