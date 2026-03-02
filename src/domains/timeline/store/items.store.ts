import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ItemCard } from '../types/item.types'
import { fetchItemsByGroupId, fetchItemById, fetchAllItems } from '../api/items.api'

export const useItemsStore = defineStore('items', () => {
  // State
  const items = ref<ItemCard[]>([])
  const selectedGroupId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const loadItems = async (groupId: string) => {
    selectedGroupId.value = groupId
    loading.value = true
    error.value = null
    
    try {
      const fetchedItems = await fetchItemsByGroupId(groupId)
      items.value = fetchedItems
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load items'
      console.error('Error loading items:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const loadAllItems = async () => {
    loading.value = true
    error.value = null
    
    try {
      const fetchedItems = await fetchAllItems()
      items.value = fetchedItems
      selectedGroupId.value = null // 모든 아이템 로드시 특정 그룹 선택 해제
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load all items'
      console.error('Error loading all items:', err)
      items.value = []
    } finally {
      loading.value = false
    }
  }

  const loadItemDetail = async (itemId: string) => {
    try {
      const item = await fetchItemById(itemId)
      if (item) {
        const index = items.value.findIndex((i) => i.id === itemId)
        if (index !== -1) {
          items.value[index] = item
        }
      }
    } catch (err) {
      console.error('Error loading item detail:', err)
    }
  }

  const clearItems = () => {
    items.value = []
    selectedGroupId.value = null
  }

  const reset = () => {
    items.value = []
    selectedGroupId.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    items,
    selectedGroupId,
    loading,
    error,
    
    // Actions
    loadItems,
    loadAllItems,
    loadItemDetail,
    clearItems,
    reset,
  }
})
