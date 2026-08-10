<template>
  <div class="roadmap-wrapper">
    <div v-if="store.loading" class="feedback">로드맵 데이터를 불러오는 중입니다...</div>
    <div v-else-if="store.error" class="feedback error">{{ store.error }}</div>
    <div class="dxplm-vis-timeline-wrapper">
      <div ref="timelineRef" class="dxplm-vis-timeline roadmap" @click="onContainerClick"></div>
      <ItemHoverLayerPopup
        :show="popupState.show"
        :pinned="popupState.pinned"
        :top="popupPosition.top"
        :left="popupPosition.left"
        :item-data="popupItem"
        @close="closePopup(true)"
        @open-detail="onOpenDetailFromPopup"
        @enter="onPopupEnter"
        @leave="onPopupLeave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @component WorkspaceNewTimeline
 * @description workspaceNew 전용 vis-timeline 래퍼 컴포넌트.
 *
 * 구조:
 * - vis-timeline 인스턴스를 timelineRef DOM 에 마운트
 * - store (useWorkspaceNewTimelineStore) 에서 DataSet(itemsDS, groupsDS) 을 직접 사용
 * - useTimeline composable 이 그룹 토글, 아이템 lazy load, 화살표 등을 담당
 * - useTimelineHoverPopup composable 이 hover 팝업 UI를 담당
 *
 * ⚠️ vis-timeline + Vue 반응형 충돌 방지:
 *   - store의 itemsDS, groupsDS 는 markRaw() 로 선언되어 Proxy 없이 사용됩니다.
 *   - props 로부터 받은 데이터를 DataSet 에 주입할 때는 반드시 toRaw() 를 사용합니다.
 *   - watch 의 deep:true 는 groups(소규모)에만 적용하고, allItems 변경은 참조 변동으로 감지합니다.
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { toRaw } from 'vue'
defineOptions({ name: 'WorkspaceNewTimeline' })
import { Timeline } from 'vis-timeline/standalone'
import { itemTemplate, groupTemplate } from './templates'
import { useWorkspaceNewTimelineStore } from './timeline.store'
import useTimelineOption from './useTimelineOption'
import { useTimeline } from './useTimeline'
import ItemHoverLayerPopup from './ItemHoverLayerPopup.vue'
import { useTimelineHoverPopup } from './useTimelineHoverPopup'

const store = useWorkspaceNewTimelineStore()

const timelineRef = ref<HTMLElement | null>(null)
let timelineInstance: Timeline | null = null
const itemMargin = 3
type TimelineRecord = Record<string, unknown>

const props = defineProps({
  allItems: { type: Array, default: () => [] },
  options: { type: Object, default: () => ({}) },
  groups: { type: Array, default: () => [] },
  currentTimeColor: { type: String, default: '#1E90FF' },
  viewMode: { type: String, default: 'QUARTER' },
  hideEmptyGroups: { type: Boolean, default: false },
  viewStatus: {
    type: Object,
    default: () => ({
      statusPlan: false,
      statusExec: false,
      statusNBiz: false,
    }),
  },
  useItemTooltip: { type: Boolean, default: true },
  msg: { type: String, default: '' },
})

const emit = defineEmits(['item-select', 'zoom-state-change', 'open-detail-slide'])

const getDdName = (masterCode: string, code: string) => {
  return store.getDdName(masterCode, code)
}

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
} =
  useTimeline(props, emit, store, getDdName)

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
  getAllItems: () => props.allItems as TimelineRecord[],
  useItemTooltip: () => props.useItemTooltip,
  getTimeline: () => timelineInstance,
  getTimelineContainer: () => timelineRef.value,
  itemMargin,
  onOpenDetail: (item) => emit('open-detail-slide', item),
})

/**
 * 외부에서 주입된 groups 배열로 groupsDS를 갱신합니다.
 *
 * ⚠️ toRaw() 필수: props.groups 는 Vue Proxy이므로 DataSet에 주입 전 toRaw() 처리합니다.
 *   spread({...group}) 이후에도 Proxy 래퍼가 남아있을 수 있어 toRaw 를 먼저 적용합니다.
 */
const reloadGroups = (groups: TimelineRecord[]) => {
  if (!groups || !timelineInstance) return
  const processed = groups.map((group) => {
    // toRaw: Vue Proxy 래퍼를 제거한 순수 객체를 DataSet 에 전달
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

/**
 * 외부 groups prop 변경 감지.
 * groups 는 소규모 배열이므로 deep watch 비용이 낮습니다.
 * 부모가 groups 배열을 직접 변경(push/splice)하는 경우에도 감지됩니다.
 */
watch(
  () => props.groups,
  (newVal) => reloadGroups(newVal as TimelineRecord[]),
  { deep: true },
)

/**
 * 외부 allItems prop 변경 감지.
 * allItems 는 대규모 배열일 수 있으므로, 참조 변경(새 배열 할당)만 감지합니다.
 * 부모가 새 배열 참조를 할당할 때만 DataSet 전체 재로드가 발생합니다.
 * 내부 변경(push/splice)은 감지되지 않습니다 — 필요하면 { deep: true } 로 변경하세요.
 */
watch(
  () => props.allItems,
  (newVal) => {
    if ((newVal as TimelineRecord[]).length > 0) {
      reloadData(newVal as TimelineRecord[])
    }
  },
)

onMounted(async () => {
  if (!timelineRef.value) return

  // 1. 공통 코드(상태명 등) 미리 로드
  await store.syncDdCode('TES.ROAD_STATUS')

  const currentOptions = makeTimelineOptions(props.viewMode as 'MONTH' | 'QUARTER')
  const options = {
    ...currentOptions,
    /**
     * itemTemplate: vis-timeline이 각 아이템을 렌더링할 때 호출.
     * DOM 엘리먼트를 반환해 innerHTML 파싱 비용을 줄입니다.
     */
    template: (_item: unknown, _element: HTMLElement, data: TimelineRecord) => {
      const div = document.createElement('div')
      div.innerHTML = itemTemplate(data, timelineState)
      return div
    },
    /**
     * groupTemplate: vis-timeline이 각 그룹 행을 렌더링할 때 호출.
     * vis-group-custom 클래스로 래핑합니다.
     */
    groupTemplate: (group: TimelineRecord) => {
      const div = document.createElement('div')
      div.classList.add('vis-group-custom')
      div.innerHTML = groupTemplate(group, group.checked !== false, props.msg)
      return div
    },
    stack: true,
    // stackSubgroups: true,
    editable: true,
  }

  // 2. vis-timeline 인스턴스 생성 (markRaw된 DataSet 직접 사용)
  timelineInstance = new Timeline(timelineRef.value, itemsDS, groupsDS, options as never)
  setInstance(timelineInstance)

  // 3. 아이템 로드 (prop이 있으면 prop 우선, 없으면 API 호출)
  if ((props.allItems as TimelineRecord[]).length > 0) {
    reloadData(props.allItems as TimelineRecord[])
  } else {
    await store.loadItems({ roadmapType: 'PRM', includeInactive: false })
  }

  // 4. 그룹 로드 (prop이 있으면 prop 우선, 없으면 API 호출)
  if ((props.groups as TimelineRecord[]).length > 0) {
    reloadGroups(props.groups as TimelineRecord[])
  } else {
    await store.loadGroups({ roadmapType: 'PRM', langCode: 'Ko' })
  }

  // 5. vis-timeline 이벤트 바인딩
  timelineInstance.on('select', (properties: { items?: Array<string | number> }) => {
    if (!properties.items?.length) return
    const selectedId = properties.items[0]
    const item = itemsDS.get(selectedId)
    if (item) emit('open-detail-slide', item)
  })

  timelineInstance.on('itemover', handleTimelineItemOver)
  timelineInstance.on('itemout', handleTimelineItemOut)
  timelineInstance.on('click', handleTimelineClick)
  timelineInstance.on('rangechange', handleTimelineViewportChange)
  timelineInstance.on('rangechanged', handleTimelineViewportChange)
  timelineInstance.on('changed', handleTimelineViewportChange)

  // 6. 팝업 전역 리스너(document click 등) 등록
  attachGlobalListeners()

})

onBeforeUnmount(() => {
  detachGlobalListeners()
  destroyTimelineArrows()
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

:deep(.vis-item.child-trm-card .vis-item-title) {
  font-size: 12px;
  line-height: 1.35;
  font-weight: 700;
}

:deep(.vis-item.child-trm-card .vis-item-tech) {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
}

:deep(.vis-item .vis-item-add) {
  cursor: pointer;
  user-select: none;
}

:deep(.vis-item .vis-item-add.active) {
  background: #16a34a;
  color: white;
}
</style>
