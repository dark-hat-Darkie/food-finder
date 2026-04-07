export interface FoodCourtResponse {
  id: string
  name: string
  slug: string
  address?: string
  location?: string
  imageUrl?: string
  isActive: boolean
  tableCount?: number
  merchantCount?: number
  createdAt: string
}

export interface TableResponse {
  id: string
  number: number
  qrCodeUrl?: string
  isActive: boolean
  foodCourtId: string
}
