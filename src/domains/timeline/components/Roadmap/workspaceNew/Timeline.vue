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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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
  attachGlobalListeners,
  detachGlobalListeners,
} = useTimelineHoverPopup({
  itemsDS,
  getAllItems: () => props.allItems as TimelineRecord[],
  useItemTooltip: () => props.useItemTooltip,
  onOpenDetail: (item) => emit('open-detail-slide', item),
})

const reloadGroups = (groups: TimelineRecord[]) => {
  if (!groups || !timelineInstance) return
  const processed = groups.map((group) => ({
    ...group,
    id: String(group.id),
    content: group.content || group.name || String(group.id),
  }))
  groupsDS.clear()
  groupsDS.add(processed)
  store.setGroups(processed)
}

watch(
  () => props.groups,
  (newVal) => reloadGroups(newVal as TimelineRecord[]),
  { deep: true },
)

watch(
  () => props.allItems,
  (newVal) => {
    if ((newVal as TimelineRecord[]).length > 0) {
      reloadData(newVal as TimelineRecord[])
    }
  },
  { deep: true },
)

onMounted(async () => {
  if (!timelineRef.value) return

  await store.syncDdCode('TES.ROAD_STATUS')

  const currentOptions = makeTimelineOptions(props.viewMode as 'MONTH' | 'QUARTER')
  const options = {
    ...currentOptions,
    template: (_item: unknown, _element: HTMLElement, data: TimelineRecord) => {
      const div = document.createElement('div')
      div.innerHTML = itemTemplate(data, timelineState)
      return div
    },
    groupTemplate: (group: TimelineRecord) => {
      const div = document.createElement('div')
      div.classList.add('vis-group-custom')
      div.innerHTML = groupTemplate(group, group.checked !== false, props.msg)
      return div
    },
  }

  timelineInstance = new Timeline(timelineRef.value, itemsDS, groupsDS, options as never)
  setInstance(timelineInstance)

  if ((props.allItems as TimelineRecord[]).length > 0) {
    reloadData(props.allItems as TimelineRecord[])
  } else {
    await store.loadItems({ roadmapType: 'PRM', includeInactive: false })
  }

  if ((props.groups as TimelineRecord[]).length > 0) {
    reloadGroups(props.groups as TimelineRecord[])
  } else {
    await store.loadGroups({ roadmapType: 'PRM', langCode: 'Ko' })
  }

  timelineInstance.on('select', (properties: { items?: Array<string | number> }) => {
    if (!properties.items?.length) return
    const selectedId = properties.items[0]
    const item = itemsDS.get(selectedId)
    if (item) emit('open-detail-slide', item)
  })

  timelineInstance.on('itemover', handleTimelineItemOver)
  timelineInstance.on('itemout', handleTimelineItemOut)
  timelineInstance.on('click', handleTimelineClick)

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
