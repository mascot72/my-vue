<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useItemsStore } from '../../store/items.store'
import ItemCard from './ItemCard.vue'
import LayerPopup from './LayerPopup.vue'
import type { ItemCard as ItemCardType } from '../../types/item.types'

const itemsStore = useItemsStore()
const { items, loading, error, popupVisible, popupItem, popupPosition } = storeToRefs(itemsStore)

const handleMouseEnter = (item: ItemCardType, event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  itemsStore.showPopup(item.id, rect.right, rect.top)
}

const handleMouseLeave = () => {
  itemsStore.hidePopup()
}
</script>

<template>
  <div class="items-grid">
    <div class="grid-header">
      <h3>Items</h3>
      <div v-if="loading" class="loading-indicator">
        <div class="spinner-small"></div>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <span>⚠️ {{ error }}</span>
    </div>

    <div class="grid-content">
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading items...</span>
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="items.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h4>No items yet</h4>
        <p>Select a group from the tree to view items</p>
      </div>

      <!-- 아이템 그리드 -->
      <div v-else class="items-container">
        <ItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        />
      </div>
    </div>

    <!-- Layer Popup -->
    <LayerPopup
      v-if="popupVisible && popupItem"
      :item="popupItem"
      :position="popupPosition"
      :visible="popupVisible"
    />
  </div>
</template>

<style scoped>
.items-grid {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.grid-header {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.loading-indicator {
  display: flex;
  align-items: center;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.error-message {
  padding: 0.75rem 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  font-size: 0.875rem;
  border-bottom: 1px solid #fecaca;
}

.grid-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  color: #6b7280;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
  padding: 3rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

.items-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 반응형 */
@media (max-width: 1200px) {
  .items-container {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .items-container {
    grid-template-columns: 1fr;
  }

  .grid-content {
    padding: 1rem;
  }
}

/* 스크롤바 스타일 */
.grid-content::-webkit-scrollbar {
  width: 8px;
}

.grid-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.grid-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.grid-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
