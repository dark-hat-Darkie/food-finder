export interface CategoryResponse {
  id: string
  name: string
  imageUrl?: string
  merchantId: string
}

export interface MenuItemResponse {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  isAvailable: boolean
  prepTime?: number
  categoryId: string
  merchantId: string
  category?: CategoryResponse
}

export interface CreateMenuItemInput {
  name: string
  description?: string
  price: number
  imageUrl?: string
  prepTime?: number
  categoryId: string
}

export interface UpdateMenuItemInput {
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  isAvailable?: boolean
  prepTime?: number
  categoryId?: string
}

export interface CartItem {
  menuItem: MenuItemResponse
  quantity: number
  specialInstructions?: string
}
