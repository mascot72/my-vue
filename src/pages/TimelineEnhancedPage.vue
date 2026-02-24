<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import GroupsTree from '@/domains/timeline/components/tree/GroupsTree.vue'
import TimelineView from '@/domains/timeline/components/TimelineView.vue'
import LayerPopup from '@/domains/timeline/components/items/LayerPopup.vue'
import { useItemsStore } from '@/domains/timeline/store/items.store'
import { useTreeStore } from '@/domains/timeline/store/tree.store'
import { useItemsTimeline } from '@/domains/timeline/composables/useItemsTimeline'
import type { ItemCard } from '@/domains/timeline/types/item.types'
import type { TreeNode } from '@/domains/timeline/types/tree.types'
import type { TimelineGroup } from 'vis-timeline'

// Props for switching between GroupsTree and Timeline Groups
const props = withDefaults(
  defineProps<{
    showGroupsTree?: boolean
  }>(),
  {
    showGroupsTree: false,
  }
)

const itemsStore = useItemsStore()
const { items } = storeToRefs(itemsStore)

const treeStore = useTreeStore()
const { nodes } = storeToRefs(treeStore)

// 초기 로드
onMounted(async () => {
  await treeStore.loadRootNodes()
  await itemsStore.loadAllItems()
})

// 표시되는 노드를 재귀적으로 수집 (루트 + 펼쳐진 노드의 자식들) - 트리 순서 유지
const getVisibleNodesInOrder = (): TreeNode[] => {
  const visibleNodes: TreeNode[] = []
  
  const collectVisible = (node: TreeNode) => {
    visibleNodes.push(node)
    
    // 노드가 펼쳐져 있고 자식이 있으면 자식들도 순서대로 추가
    if (node.isExpanded && node.children && node.children.length > 0) {
      node.children.forEach((child: TreeNode) => collectVisible(child))
    }
  }
  
  // 루트 노드부터 시작 (순서대로)
  Array.from(nodes.value.values())
    .filter(node => node.level === 1)
    .sort((a, b) => a.id.localeCompare(b.id)) // ID 순서대로 정렬
    .forEach(rootNode => collectVisible(rootNode))
  
  return visibleNodes
}

// 표시되는 노드 ID 집합 (필터링용)
const getVisibleNodeIds = (): Set<string> => {
  return new Set(getVisibleNodesInOrder().map(node => node.id))
}

// tree nodes를 timeline groups로 변환 (트리 순서대로)
const timelineGroups = computed<TimelineGroup[]>(() => {
  const visibleNodes = getVisibleNodesInOrder()
  
  return visibleNodes.map((node, index) => {
    // 노드 타입에 따른 아이콘
    const icon = !node.hasChildren ? '📄' : (node.isExpanded ? '📂' : '📁')
    
    return {
      id: node.id,
      content: `<div class="timeline-group-label" data-level="${node.level}">
        <span class="timeline-group-icon">${icon}</span>
        <span class="timeline-group-name">${node.name}</span>
      </div>`,
      title: node.name,
      level: node.level,
      order: index // 트리 순서 유지
    }
  })
})

// items를 timeline items로 변환 (펼쳐진 그룹의 아이템만 표시)
const visibleItems = computed(() => {
  const visibleIds = getVisibleNodeIds()
  return items.value.filter(item => visibleIds.has(item.groupId))
})

const { timelineItems } = useItemsTimeline(visibleItems)

// 팝업 상태
const popupVisible = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const popupItem = ref<ItemCard | null>(null)

// 카드 호버 이벤트 처리
const handleItemHover = (event: { itemId: string | null; x: number; y: number }) => {
  if (event.itemId) {
    // itemId로 원본 아이템 찾기 (index 기반)
    const index = parseInt(event.itemId) - 1
    const item = visibleItems.value[index]
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

// 그룹 클릭 이벤트 처리 (펼치기/접기)
const handleGroupClick = async (groupId: string) => {
  await treeStore.toggleNode(groupId)
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
        <GroupsTree />
      </aside>

      <!-- 오른쪽: Timeline View (카드가 시간축에 배치) -->
      <main class="items-section" :class="{ 'full-width': !props.showGroupsTree }">
        <div class="timeline-wrapper">
          <div class="timeline-header">
            <h3>Items Timeline</h3>
            <p class="timeline-subtitle">Items displayed on timeline grid by date range</p>
          </div>
          <div class="timeline-container">
            <TimelineView 
              :items="timelineItems" 
              :groups="timelineGroups"
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
