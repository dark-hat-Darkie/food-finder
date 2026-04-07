const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  getFoodCourt: (id: string) => fetchApi<any>(`/food-courts/${id}`),
  getFoodCourtBySlug: (slug: string) => fetchApi<any>(`/food-courts/slug/${slug}`),
  getMerchantMenu: (merchantId: string) => fetchApi<any[]>(`/merchants/${merchantId}/menu-items`),
  getMerchantCategories: (merchantId: string) => fetchApi<any[]>(`/merchants/${merchantId}/categories`),
  getFoodCourtMerchants: (foodCourtId: string) => fetchApi<any[]>(`/food-courts/${foodCourtId}/merchants`),
  createOrder: (data: any) =>
    fetchApi<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrder: (id: string) => fetchApi<any>(`/orders/${id}`),
  getOrderByNumber: (orderNumber: string) => fetchApi<any>(`/orders/number/${orderNumber}`),
  updateOrderStatus: (id: string, status: string) =>
    fetchApi<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
