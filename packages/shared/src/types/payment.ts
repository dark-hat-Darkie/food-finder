export enum PaymentPayStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface MerchantPaymentResponse {
  id: string
  amount: number
  status: PaymentPayStatus
  referenceNumber?: string
  notes?: string
  merchantId: string
  periodStart: string
  periodEnd: string
  paidAt?: string
  createdAt: string
}

export interface CreatePaymentInput {
  merchantId: string
  amount: number
  referenceNumber?: string
  notes?: string
  periodStart: string
  periodEnd: string
}
