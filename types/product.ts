export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  image: string
  images: string[] // Array of additional images
  category: string
  ageRange: string
  featured?: boolean
}

