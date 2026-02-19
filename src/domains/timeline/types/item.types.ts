/**
 * Item Card 관련 타입 정의
 */

export interface ItemCard {
  id: string
  title: string
  description: string
  imageUrl?: string
  status: 'active' | 'pending' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

export interface ItemDetailPopup {
  visible: boolean
  itemId: string | null
  position: {
    x: number
    y: number
  }
}

export interface ItemsState {
  items: ItemCard[]
  loading: boolean
  error: string | null
  selectedGroupId: string | null
  hoveredItemId: string | null
}
