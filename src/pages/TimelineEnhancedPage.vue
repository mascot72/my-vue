<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import GroupsTree from '@/domains/timeline/components/tree/GroupsTree.vue'
import TimelineView from '@/domains/timeline/components/TimelineView.vue'
import LayerPopup from '@/domains/timeline/components/items/LayerPopup.vue'
import { useItemsStore } from '@/domains/timeline/store/items.store'
import { useItemsTimeline } from '@/domains/timeline/composables/useItemsTimeline'
import type { ItemCard } from '@/domains/timeline/types/item.types'

const itemsStore = useItemsStore()
const { items } = storeToRefs(itemsStore)

// items를 timeline items로 변환
const { timelineItems } = useItemsTimeline(items)

// 팝업 상태
const popupVisible = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const popupItem = ref<ItemCard | null>(null)

// 카드 호버 이벤트 처리
const handleItemHover = (event: { itemId: string | null; x: number; y: number }) => {
  if (event.itemId) {
    // itemId로 원본 아이템 찾기 (index 기반)
    const index = parseInt(event.itemId) - 1
    const item = items.value[index]
    if (item) {
      popupItem.value = item
      popupPosition.value = { x: event.x, y: event.y }
      popupVisible.value = true
    }
  } else {
    popupVisible.value = false
    popupItem.value = null
  }
}
</script>

<template>
  <div class="timeline-enhanced-page">
    <div class="page-header">
      <h1>Enhanced Timeline</h1>
      <p class="subtitle">Browse groups and explore items with interactive cards</p>
    </div>

    <div class="page-content">
      <!-- 왼쪽: Groups Tree -->
      <aside class="groups-section">
        <GroupsTree />
      </aside>

      <!-- 오른쪽: Timeline View (카드가 시간축에 배치) -->
      <main class="items-section">
        <div class="timeline-wrapper">
          <div class="timeline-header">
            <h3>Items Timeline</h3>
            <p class="timeline-subtitle">Items displayed on timeline grid by date range</p>
          </div>
          <div class="timeline-container">
            <TimelineView :items="timelineItems" @item-hover="handleItemHover" />
          </div>
        </div>
      </main>
    </div>

    <!-- 마우스 오버 팝업 -->
    <LayerPopup
      v-if="popupItem"
      :item="popupItem"
      :position="popupPosition"
      :visible="popupVisible"
    />
  </div>
</template>

<style scoped>
@import '@/domains/timeline/styles/timeline.css';

.timeline-enhanced-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.page-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #eff6ff, #f9fafb);
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.page-content {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 0;
  gap: 0;
}

.groups-section {
  height: 100%;
  overflow-y: auto;
  width: 100%;
}

.items-section {
  height: 100%;
  width: 100%;
  min-width: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.timeline-wrapper {
  height: 100%;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.timeline-header {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.timeline-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.timeline-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.timeline-container {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0.5rem;
  min-height: 0;
}

/* 반응형 */
@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 280px 1fr;
  }
}

@media (max-width: 768px) {
  .page-content {
    grid-template-columns: 1fr;
  }

  .groups-section {
    display: none;
  }

  .page-header {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }
}
</style>
