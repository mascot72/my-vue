<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import GroupsTree from '@/domains/timeline/components/tree/GroupsTree.vue'
import ExpandAllControl from '@/domains/timeline/components/tree/ExpandAllControl.vue'
import TimelineView from '@/domains/timeline/components/TimelineView.vue'
import LayerPopup from '@/domains/timeline/components/items/LayerPopup.vue'
import { useItemsStore } from '@/domains/timeline/store/items.store'
import { useTreeStore } from '@/domains/timeline/store/tree.store'
import { useVisibleNodes } from '@/domains/timeline/composables/useVisibleNodes'
import { useTimelineGroups } from '@/domains/timeline/composables/useTimelineGroups'
import { useItemsTimeline } from '@/domains/timeline/composables/useItemsTimeline'
import type { ItemCard } from '@/domains/timeline/types/item.types'

// Props
const props = withDefaults(
  defineProps<{
    showGroupsTree?: boolean
  }>(),
  {
    showGroupsTree: false,
  }
)

// Stores
const itemsStore = useItemsStore()
const treeStore = useTreeStore()
const { items } = storeToRefs(itemsStore)
const { nodes } = storeToRefs(treeStore)

// 모두 펼치기/접기 상태
const expandAllGroups = ref(false)

// 초기 로드
onMounted(async () => {
  await treeStore.loadRootNodes()
  await itemsStore.loadAllItems()
})

// 모두 펼치기/접기 토글
watch(expandAllGroups, async (newValue) => {
  if (newValue) {
    await treeStore.expandAll()
  } else {
    treeStore.collapseAll()
  }
})

// 페이지 나갈 때 초기화
onUnmounted(() => {
  treeStore.reset()
  itemsStore.reset()
})

// Visible 노드 관리
const { visibleNodes, visibleNodeIds } = useVisibleNodes(nodes)

// Timeline Groups 생성
const { timelineGroups } = useTimelineGroups(visibleNodes)

// Visible Items만 필터링
const visibleItems = computed(() => {
  return items.value.filter(item => visibleNodeIds.value.has(item.groupId))
})

// Timeline Items 생성
const { timelineItems } = useItemsTimeline(visibleItems)

// 팝업 상태
const popupVisible = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const popupItem = ref<ItemCard | null>(null)

// 카드 호버 처리
const handleItemHover = (event: { itemId: string | null; x: number; y: number }) => {
  if (!event.itemId) {
    popupVisible.value = false
    popupItem.value = null
    return
  }

  const index = parseInt(event.itemId) - 1
  const item = visibleItems.value[index]
  
  if (item) {
    popupItem.value = item
    popupPosition.value = { x: event.x, y: event.y }
    popupVisible.value = true
  }
}

// 그룹 클릭 처리 (펼치기/접기)
const handleGroupClick = (groupId: string) => {
  treeStore.toggleNode(groupId)
}
</script>

<template>
  <div class="timeline-enhanced-page">
    <div class="page-header">
      <h1>Enhanced Timeline</h1>
      <p class="subtitle">Browse groups and explore items with interactive cards</p>
    </div>

    <div class="page-content" :class="{ 'with-sidebar': props.showGroupsTree }">
      <!-- 왼쪽: Groups Tree (선택적 표시) -->
      <aside v-if="props.showGroupsTree" class="groups-section">
        <div class="groups-controls">
          <ExpandAllControl v-model="expandAllGroups" />
        </div>
        <GroupsTree />
      </aside>

      <!-- 오른쪽: Timeline View (카드가 시간축에 배치) -->
      <main class="items-section" :class="{ 'full-width': !props.showGroupsTree }">
        <div class="timeline-wrapper">
          <div class="timeline-header">
            <div class="timeline-header-content">
              <div class="timeline-header-text">
                <h3>Items Timeline</h3>
                <p class="timeline-subtitle">Items displayed on timeline grid by date range</p>
              </div>
              <!-- GroupsTree가 숨겨진 경우 여기에 체크박스 표시 -->
              <div v-if="!props.showGroupsTree" class="timeline-controls">
                <ExpandAllControl v-model="expandAllGroups" />
              </div>
            </div>
          </div>
          <div class="timeline-container">
            <TimelineView 
              :items="timelineItems" 
              :groups="timelineGroups"
              theme-class="timeline-enhanced-theme"
              @item-hover="handleItemHover"
              @group-click="handleGroupClick"
            />
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
  grid-template-columns: 1fr;
  min-height: 0;
  gap: 0;
}

/* GroupsTree가 활성화되면 사용 */
.page-content.with-sidebar {
  grid-template-columns: 280px 1fr;
}

.groups-section {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.groups-controls {
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.groups-section :deep(.groups-tree) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.items-section {
  height: 100%;
  width: 100%;
  min-width: 0;
  overflow-y: auto;
  overflow-x: auto;
}

.items-section.full-width {
  grid-column: 1;
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

.timeline-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.timeline-header-text {
  flex: 1;
  min-width: 0;
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

.timeline-controls {
  flex-shrink: 0;
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
  
  .timeline-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .timeline-controls {
    width: 100%;
  }
}

/* TimelineEnhancedPage 전용 vis-timeline 스타일 */
.timeline-container :deep(.timeline-enhanced-theme.vis-timeline) {
  border-color: #10b981;
  box-shadow: 0 1px 3px 0 rgb(16 185 129 / 0.1);
  background: white;
}

.timeline-container :deep(.timeline-enhanced-theme .vis-panel) {
  background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
}

.timeline-container :deep(.timeline-enhanced-theme .vis-grid.vis-major) {
  border-color: #34d399;
}

.timeline-container :deep(.timeline-enhanced-theme .vis-current-time) {
  background-color: #059669;
  width: 2px;
}

.timeline-container :deep(.timeline-enhanced-theme .vis-labelset .vis-label:hover) {
  background: #ecfdf5;
}

/* Enhanced 페이지의 카드 스타일 커스터마이징 */
.timeline-container :deep(.timeline-enhanced-theme .timeline-card) {
  box-shadow: 0 1px 3px 0 rgb(16 185 129 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.05);
}

.timeline-container :deep(.timeline-enhanced-theme .timeline-card:hover) {
  box-shadow: 0 4px 12px 0 rgb(16 185 129 / 0.15), 0 2px 4px -1px rgb(0 0 0 / 0.08);
  border-color: #10b981;
}
</style>
