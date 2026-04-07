export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
}

export const PAYMENT_PAY_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  PAID: 'Paid',
  REJECTED: 'Rejected',
}

export const PAYMENT_PAY_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

export const ITEMS_PER_PAGE = 20
export const MAX_CART_ITEMS = 50

export const API_ROUTES = {
  AUTH: {
    ADMIN_LOGIN: '/auth/admin/login',
    MERCHANT_LOGIN: '/auth/merchant/login',
    MERCHANT_REGISTER: '/auth/merchant/register',
    MERCHANT_PROFILE: '/auth/merchant/profile',
  },
  FOOD_COURTS: '/food-courts',
  TABLES: (foodCourtId: string) => `/food-courts/${foodCourtId}/tables`,
  MERCHANTS: '/merchants',
  MERCHANT_MENU: (merchantId: string) => `/merchants/${merchantId}/menu-items`,
  MERCHANT_CATEGORIES: (merchantId: string) => `/merchants/${merchantId}/categories`,
  ORDERS: '/orders',
  ORDER_STATUS: (orderId: string) => `/orders/${orderId}/status`,
  PAYMENTS: '/merchant-payments',
  PAYMENT_MARK_PAID: (paymentId: string) => `/merchant-payments/${paymentId}/mark-paid`,
  UPLOAD: '/upload',
  QR_GENERATE: (tableId: string) => `/qrcodes/generate/${tableId}`,
  QR_TABLE: (tableId: string) => `/qrcodes/table/${tableId}`,
} as const
