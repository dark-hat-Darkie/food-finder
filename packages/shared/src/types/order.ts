export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface OrderItemInput {
  menuItemId: string
  quantity: number
  specialInstructions?: string
}

export interface CreateOrderInput {
  tableId: string
  foodCourtId: string
  merchantId: string
  items: OrderItemInput[]
  customerNote?: string
  customerPhone: string
}

export interface OrderItemResponse {
  id: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specialInstructions?: string
  menuItemId: string
  menuItemName: string
}

export interface OrderResponse {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  customerNote?: string
  customerPhone: string
  tableId: string
  tableNumber: number
  foodCourtId: string
  merchantId: string
  orderItems: OrderItemResponse[]
  createdAt: string
  updatedAt: string
}
