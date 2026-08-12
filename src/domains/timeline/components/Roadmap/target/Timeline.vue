<!--
  Timeline.vue (target)

  출처: workspaceNew/Timeline.vue (기반) + origin/VisTimeline.vue (컨텍스트 메뉴, 디테일 패널 패턴)

  변경 내용:
  - ContextMenu.vue: 우클릭(contextmenu) 이벤트 통합
  - RoadmapDetailsPanel.vue: 슬라이드 상세 패널 통합
  - target/ItemHoverLayerPopup.vue: 확장형 팝업으로 교체
  - target/templates.ts 의 itemTemplate / groupTemplate 사용
  - workspaceNew composable (useTimeline, useTimelineHoverPopup, useTimelineOption) 재사용

  ⚠️ 주의:
  - vis-timeline DataSet 은 Proxy-free 유지를 위해 markRaw 패턴 유지
  - 우클릭 이벤트는 vis-timeline oncontextmenu 이벤트와 네이티브 'contextmenu' DOM 이벤트를 함께 사용
-->
<template>
  <div class="roadmap-wrapper">
    <div v-if="store.loading" class="feedback">로드맵 데이터를 불러오는 중입니다...</div>
    <div v-else-if="store.error" class="feedback error">{{ store.error }}</div>

    <div class="dxplm-vis-timeline-wrapper">
      <div
        ref="timelineRef"
        class="dxplm-vis-timeline roadmap"
        @click="onContainerClick"
        @contextmenu.prevent="onNativeContextMenu"
      ></div>

      <!-- 아이템 호버 팝업 (B-5 target/ItemHoverLayerPopup.vue) -->
      <ItemHoverLayerPopup
        :show="popupState.show"
        :pinned="popupState.pinned"
        :top="popupPosition.top"
        :left="popupPosition.left"
        :item-data="popupItem"
        :view-status="props.viewStatus"
        @close="closePopup(true)"
        @open-detail="onOpenDetailFromPopupWrapped"
        @enter="onPopupEnter"
        @leave="onPopupLeave"
      />

      <!-- 컨텍스트 메뉴 (B-7 target/ContextMenu.vue) -->
      <ContextMenu
        :show="contextMenu.show"
        :top="contextMenu.top"
        :left="contextMenu.left"
        :items="contextMenuItems"
        :data="contextMenu.itemData"
        @close="closeContextMenu"
      />
    </div>

    <!-- 상세 패널 슬라이드 (B-6 target/RoadmapDetailsPanel.vue) -->
    <RoadmapDetailsPanel
      :show="detailPanel.show"
      :item-data="detailPanel.itemData"
      @close="detailPanel.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { toRaw } from 'vue'
import { Timeline } from 'vis-timeline/standalone'

// target 전용 컴포넌트
import ItemHoverLayerPopup from './ItemHoverLayerPopup.vue'
import ContextMenu from './ContextMenu.vue'
import RoadmapDetailsPanel from './RoadmapDetailsPanel.vue'

// target 전용 템플릿 (origin 디자인 적용)
import { itemTemplate, groupTemplate } from './templates'

// workspaceNew 공유 composable / store
import { useWorkspaceNewTimelineStore } from '../workspaceNew/timeline.store'
import useTimelineOption from '../workspaceNew/useTimelineOption'
import { useTimeline } from '../workspaceNew/useTimeline'
import { useTimelineHoverPopup } from '../workspaceNew/useTimelineHoverPopup'

defineOptions({ name: 'TargetTimeline' })

// ── Props ──────────────────────────────────────────────────────────────────
const props = defineProps({
  allItems:         { type: Array,   default: () => [] },
  options:          { type: Object,  default: () => ({}) },
  groups:           { type: Array,   default: () => [] },
  currentTimeColor: { type: String,  default: '#1E90FF' },
  viewMode:         { type: String,  default: 'QUARTER' },
  hideEmptyGroups:  { type: Boolean, default: false },
  viewStatus: {
    type: Object,
    default: () => ({ statusPlan: false, statusExec: false, statusNBiz: false }),
  },
  useItemTooltip: { type: Boolean, default: true },
  msg:            { type: String,  default: '' },
})

const emit = defineEmits(['item-select', 'zoom-state-change', 'open-detail-slide'])

type RecordAny = Record<string, unknown>

// ── Store / Timeline 기반 ──────────────────────────────────────────────────
const store = useWorkspaceNewTimelineStore()

const timelineRef  = ref<HTMLElement | null>(null)
let timelineInstance: Timeline | null = null
const itemMargin = 3

const getDdName = (masterCode: string, code: string) => store.getDdName(masterCode, code)

const { makeTimelineOptions } = useTimelineOption({
  itemMargin,
  options: props.options,
  viewMode: props.viewMode as 'MONTH' | 'QUARTER',
})

const {
  itemsDS,
  groupsDS,
  timelineState,
  reloadData,
  onContainerClick,
  toggleAllGroups,
  toggleGroupVisibility,
  setInstance,
  expandAllSubItems,
  collapseAllSubItems,
  focusItemById,
  destroyTimelineArrows,
} = useTimeline(props, emit, store, getDdName)

// ── Hover 팝업 ────────────────────────────────────────────────────────────
const {
  popupState,
  popupItem,
  popupPosition,
  closePopup,
  onPopupEnter,
  onPopupLeave,
  onOpenDetailFromPopup,
  handleTimelineItemOver,
  handleTimelineItemOut,
  handleTimelineClick,
  handleTimelineViewportChange,
  attachGlobalListeners,
  detachGlobalListeners,
} = useTimelineHoverPopup({
  itemsDS,
  getAllItems: () => props.allItems as RecordAny[],
  useItemTooltip: () => props.useItemTooltip,
  getTimeline: () => timelineInstance,
  getTimelineContainer: () => timelineRef.value,
  itemMargin,
  onOpenDetail: (item) => emit('open-detail-slide', item),
})

// ── 상세 패널 ──────────────────────────────────────────────────────────────
const detailPanel = reactive<{ show: boolean; itemData: RecordAny | null }>({
  show: false,
  itemData: null,
})

const onOpenDetail = (item: RecordAny) => {
  detailPanel.itemData = item
  detailPanel.show = true
  emit('open-detail-slide', item)
}

const onOpenDetailFromPopupWrapped = (item: RecordAny) => {
  onOpenDetailFromPopup(item as never)
  onOpenDetail(item)
}

// ── 컨텍스트 메뉴 ──────────────────────────────────────────────────────────
const contextMenu = reactive<{
  show: boolean
  top: number
  left: number
  itemData: RecordAny | null
}>({
  show: false,
  top: 0,
  left: 0,
  itemData: null,
})

const contextMenuItems = computed(() => [
  {
    label: '상세 조회',
    action: () => {
      if (!contextMenu.itemData) return
      onOpenDetail(contextMenu.itemData)
    },
    icon: '📋',
  },
  {
    label: '이력 조회',
    action: () => {
      if (!contextMenu.itemData) return
      onOpenDetail(contextMenu.itemData)
    },
    icon: '🕘',
  },
  {
    label: '진척현황 조회',
    action: () => {
      alert('진척현황조회는 준비 중입니다.')
    },
    icon: '📊',
  },
  {
    label: '수정',
    action: () => {
      alert('수정 기능은 준비 중입니다.')
    },
    icon: '✏️',
    disabled: contextMenu.itemData?.writingStatus === 'code001', // 잠금 상태일 때 비활성
  },
])

const closeContextMenu = () => {
  contextMenu.show = false
  contextMenu.itemData = null
}

/**
 * vis-timeline 자체 contextmenu 이벤트.
 * 어떤 아이템/그룹 위에서 우클릭했는지 알 수 있습니다.
 */
const handleVisContextMenu = (properties: {
  item?: string | number | null
  group?: string | number | null
  event: MouseEvent
}) => {
  const { item, event } = properties
  event.preventDefault()

  if (!item) {
    closeContextMenu()
    return
  }

  const rawItem = itemsDS.get(item) as RecordAny | null
  if (!rawItem) return

  contextMenu.itemData = rawItem
  contextMenu.top  = event.clientY
  contextMenu.left = event.clientX
  contextMenu.show = true
}

/**
 * 네이티브 contextmenu 이벤트 (vis-timeline 이벤트가 캐치하지 못한 경우 대비).
 */
const onNativeContextMenu = (e: MouseEvent) => {
  // vis-timeline 이 이미 처리했으면 중복 실행 방지
  if (contextMenu.show) return
  // vis 이벤트에서 처리될 것이므로 단순히 기본 동작 차단
  e.preventDefault()
}

// 문서 클릭 시 컨텍스트 메뉴 닫기
const onDocumentClick = () => closeContextMenu()

// ── Groups reload ─────────────────────────────────────────────────────────
const reloadGroups = (groups: RecordAny[]) => {
  if (!groups || !timelineInstance) return
  const processed = groups.map((group) => {
    const raw = toRaw(group)
    return {
      ...raw,
      id: String(raw.id),
      content: raw.content || raw.name || String(raw.id),
    }
  })
  groupsDS.clear()
  groupsDS.add(processed)
  store.setGroups(processed)
}

watch(() => props.groups, (newVal) => reloadGroups(newVal as RecordAny[]), { deep: true })
watch(
  () => props.allItems,
  (newVal) => {
    if ((newVal as RecordAny[]).length > 0) reloadData(newVal as RecordAny[])
  },
)

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!timelineRef.value) return

  await store.syncDdCode('TES.ROAD_STATUS')

  const currentOptions = makeTimelineOptions(props.viewMode as 'MONTH' | 'QUARTER')
  const options = {
    ...currentOptions,
    template: (_item: unknown, _element: HTMLElement, data: RecordAny) => {
      const div = document.createElement('div')
      div.innerHTML = itemTemplate(data, timelineState)
      return div
    },
    groupTemplate: (group: RecordAny) => {
      const div = document.createElement('div')
      div.classList.add('vis-group-custom')
      div.innerHTML = groupTemplate(group, group.checked !== false, props.msg)
      return div
    },
  }

  timelineInstance = new Timeline(timelineRef.value, itemsDS, groupsDS, options as never)
  setInstance(timelineInstance)

  // 아이템 로드
  if ((props.allItems as RecordAny[]).length > 0) {
    reloadData(props.allItems as RecordAny[])
  } else {
    await store.loadItems({ roadmapType: 'PRM', includeInactive: false })
  }

  // 그룹 로드
  if ((props.groups as RecordAny[]).length > 0) {
    reloadGroups(props.groups as RecordAny[])
  } else {
    await store.loadGroups({ roadmapType: 'PRM', langCode: 'Ko' })
  }

  // vis-timeline 이벤트 바인딩
  timelineInstance.on('select', (properties: { items?: Array<string | number> }) => {
    if (!properties.items?.length) return
    const selectedId = properties.items[0]
    const item = itemsDS.get(selectedId) as RecordAny | null
    if (item) {
      // ⭐ 수정: detail panel은 popup에서만 열기
      // Item Card 클릭 시 popup을 pinned 상태로만 변경
      // detail panel은 popup의 "상세조회" 버튼에서만 열기
      const currentPopupItem = popupItem.value
      if (currentPopupItem && currentPopupItem.id === item.id) {
        // 같은 항목 다시 클릭: popup pinned 상태 유지
        return
      }
      // 다른 항목 클릭: popup만 업데이트 (detail panel은 열지 않음)
      popupState.pinned = true
      popupState.show = true
      popupItem.value = item
    }
  })

  timelineInstance.on('itemover', handleTimelineItemOver)
  timelineInstance.on('itemout',  handleTimelineItemOut)
  timelineInstance.on('click',    handleTimelineClick)
  timelineInstance.on('rangechange', handleTimelineViewportChange)
  timelineInstance.on('rangechanged', handleTimelineViewportChange)
  timelineInstance.on('changed', handleTimelineViewportChange)

  // 우클릭 컨텍스트 메뉴
  timelineInstance.on('contextmenu', handleVisContextMenu as never)

  attachGlobalListeners()
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  detachGlobalListeners()
  destroyTimelineArrows()
  document.removeEventListener('click', onDocumentClick)
  timelineInstance?.destroy()
})

defineExpose({
  toggleAllGroups,
  toggleGroupVisibility,
  expandAllSubItems,
  collapseAllSubItems,
  focusItemById,
})
</script>

<style scoped>
.roadmap-wrapper {
  min-height: 680px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feedback {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  padding: 12px 16px;
  color: #334155;
}

.feedback.error {
  color: #b91c1c;
  border-color: rgba(220, 38, 38, 0.25);
}

.dxplm-vis-timeline-wrapper {
  position: relative;
  min-height: 680px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

.dxplm-vis-timeline {
  min-height: 680px;
}

/* ── vis-timeline 공통 deep 스타일 ── */
:deep(.vis-item.child-trm-card) {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #22c55e;
  color: #14532d;
}

:deep(.vis-item.child-trm-card .vis-item-overflow) {
  overflow: visible;
}

:deep(.vis-item.child-trm-card .vis-item-content) {
  min-width: 220px;
  padding: 4px 8px;
  white-space: normal;
}

:deep(.vis-item .vis-item-add) {
  cursor: pointer;
  user-select: none;
}

:deep(.vis-item .vis-item-add.active) {
  background: #16a34a;
  color: white;
}

/* ── 상태별 아이템 배경 (origin 디자인) ── */
:deep(.vis-item .vis-item-wrapper.status-valid-normal)   { border-left: 3px solid #22c55e; }
:deep(.vis-item .vis-item-wrapper.status-valid-hold)     { border-left: 3px solid #f59e0b; }
:deep(.vis-item .vis-item-wrapper.status-invalid)        { border-left: 3px solid #ef4444; }
:deep(.vis-item .vis-item-wrapper.status-change)         { border-left: 3px solid #3b82f6; }
:deep(.vis-item .vis-item-wrapper.status-added)          { border-left: 3px solid #8b5cf6; }
:deep(.vis-item .vis-item-wrapper.status-deleted)        { border-left: 3px solid #94a3b8; }

/* ── 잠금 상태 ── */
:deep(.vis-item .vis-item-tags.lock)   { background: rgba(239, 68,  68, 0.08); }
:deep(.vis-item .vis-item-tags.unlock) { background: rgba(34,  197, 94, 0.06); }

/* vis-timeline 중앙 스크롤 영역 하단에 충분한 여백 확보 */
:deep(.vis-timeline .vis-panel.vis-center .vis-content) {
  padding-bottom: 300px !important; /* 하위 기술들이 펼쳐졌을 때 최대 높이만큼 넉넉하게 지정 */
}
</style>
