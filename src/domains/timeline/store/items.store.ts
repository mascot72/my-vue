import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ItemCard } from '../types/item.types'
import { fetchItemsByGroupId, fetchItemById, fetchAllItems } from '../api/items.api'

export const useItemsStore = defineStore('items', () => {
  // State
  const items = ref<ItemCard[]>([])
  const selectedGroupId = ref<string | null>(null)
  const hoveredItemId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Popup state
  const popupVisible = ref(false)
  const popupItemId = ref<string | null>(null)
  const popupPosition = ref({ x: 0, y: 0 })

  // Computed
  const hoveredItem = computed(() => {
    if (!hoveredItemId.value) return null
    return items.value.find((item) => item.id === hoveredItemId.value)
  })

  const popupItem = computed(() => {
    if (!popupItemId.value) return null
    return items.value.find((item) => item.id === popupItemId.value)
  })

  const itemsByStatus = computed(() => {
    return {
      active: items.value.filter((item) => item.status === 'active'),
      pending: items.value.filter((item) => item.status === 'pending'),
      completed: items.value.filter((item) => item.status === 'completed'),
      archived: items.value.filter((item) => item.status === 'archived'),
    }
  })

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

  const showPopup = (itemId: string, x: number, y: number) => {
    popupItemId.value = itemId
    popupPosition.value = { x, y }
    popupVisible.value = true
  }

  const hidePopup = () => {
    popupVisible.value = false
    popupItemId.value = null
  }

  const setHoveredItem = (itemId: string | null) => {
    hoveredItemId.value = itemId
  }

  const clearItems = () => {
    items.value = []
    selectedGroupId.value = null
  }

  const reset = () => {
    items.value = []
    selectedGroupId.value = null
    hoveredItemId.value = null
    loading.value = false
    error.value = null
    hidePopup()
  }

  return {
    // State
    items,
    selectedGroupId,
    hoveredItemId,
    loading,
    error,
    popupVisible,
    popupItemId,
    popupPosition,
    
    // Computed
    hoveredItem,
    popupItem,
    itemsByStatus,
    
    // Actions
    loadItems,
    loadAllItems,
    loadItemDetail,
    showPopup,
    hidePopup,
    setHoveredItem,
    clearItems,
    reset,
  }
})
