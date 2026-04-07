export interface MerchantResponse {
  id: string
  email: string
  storeName: string
  ownerName: string
  phone?: string
  description?: string
  logoUrl?: string
  isActive: boolean
  isApproved: boolean
  foodCourtId: string
  foodCourtName?: string
  balance: number
  createdAt: string
}

export interface MerchantPublicResponse {
  id: string
  storeName: string
  description?: string
  logoUrl?: string
  prepTime?: number
}

export interface MerchantLoginInput {
  email: string
  password: string
}

export interface MerchantRegisterInput {
  email: string
  password: string
  storeName: string
  ownerName: string
  phone?: string
  description?: string
  foodCourtId: string
}

export interface MerchantBankDetails {
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
}
