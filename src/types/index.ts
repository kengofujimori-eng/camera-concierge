export interface Product {
  id?: number
  name: string
  maker: string
  category: 'camera' | 'lens'
  priceRange: string
  weight: string
  features: string[]
  amazonUrl: string
  addedAt?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface DifyResponse {
  answer: string
  conversation_id: string
  message_id: string
  metadata?: Record<string, unknown>
}

export interface WarehouseItem extends Product {
  id: number
  addedAt: string
}
