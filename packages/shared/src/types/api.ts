export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface AdminLoginInput {
  email: string
  password: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalMerchants: number
  totalFoodCourts: number
  todayOrders: number
  todayRevenue: number
  pendingMerchantPayments: number
}

export interface MerchantOrderStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
}
