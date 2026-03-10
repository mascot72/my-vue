import type { ItemCard } from '../types/item.types'
import { api } from '@/shared/api/axios'

/**
 * Items API
 * Backend server와 연동하여 데이터를 가져옵니다
 */

/**
 * 그룹 ID별로 아이템 분류
 */
export const groupItemsByGroupId = (items: ItemCard[]): Record<string, ItemCard[]> => {
  return items.reduce(
    (acc, item) => {
      const groupId = item.groupId
      if (!acc[groupId]) {
        acc[groupId] = []
      }
      acc[groupId].push(item)
      return acc
    },
    {} as Record<string, ItemCard[]>
  )
}

/**
 * 특정 그룹의 아이템들 조회
 */
export const fetchItemsByGroupId = async (groupId: string): Promise<ItemCard[]> => {
  return api.get(`/items/group/${groupId}`)
}

/**
 * 모든 그룹의 아이템들 조회
 */
export const fetchAllItems = async (): Promise<ItemCard[]> => {
  return api.get('/items/all')
}

/**
 * 특정 아이템 상세 정보 조회
 */
export const fetchItemById = async (itemId: string): Promise<ItemCard | null> => {
  try {
    return await api.get(`/items/${itemId}`)
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}
