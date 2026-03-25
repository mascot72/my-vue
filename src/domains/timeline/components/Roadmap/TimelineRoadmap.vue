<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { TimelineGroup } from 'vis-timeline'
import TimelineView from '@/domains/timeline/components/TimelineView.vue'
import type { TimelineItem } from '@/domains/timeline/types'

type ViewMode = 'month' | 'quarter'

const props = withDefaults(
  defineProps<{
    items: TimelineItem[]
    groups: TimelineGroup[]
    viewMode?: ViewMode
    selectedItemId?: string | null
  }>(),
  {
    viewMode: 'month',
    selectedItemId: null,
  },
)

const emit = defineEmits<{
  'update:viewMode': [value: ViewMode]
  'select-item': [itemId: string]
  'clear-selection': []
}>()

const timelineViewRef = ref<InstanceType<typeof TimelineView> | null>(null)

const modeLabel = computed(() => (props.viewMode === 'month' ? '월 보기' : '분기 보기'))
const groupCount = computed(() => props.groups.length)
const itemCount = computed(() => props.items.length)

const getTimelineApi = () => timelineViewRef.value?.getApi()

const buildWindowRange = (mode: ViewMode) => {
  const center = new Date()
  const offset = mode === 'month' ? 6 : 12
  const start = new Date(center.getFullYear(), center.getMonth() - offset, 1)
  const end = new Date(center.getFullYear(), center.getMonth() + offset, 1)
  return { start, end }
}

const applyViewMode = async (mode: ViewMode) => {
  await nextTick()
  const api = getTimelineApi()
  if (!api) return

  const { start, end } = buildWindowRange(mode)

  api.setOptions({
    orientation: 'top',
    groupWidthMode: 'fixed',
    groupWidth: '260px',
    timeAxis: {
      scale: 'month',
      step: mode === 'month' ? 1 : 3,
    },
    start,
    end,
    min: new Date(start.getFullYear() - 1, start.getMonth(), 1),
    max: new Date(end.getFullYear() + 1, end.getMonth(), 1),
  })
}

const fitTimeline = async () => {
  await nextTick()
  if (!props.items.length) return
  getTimelineApi()?.fit()
}

const moveToToday = () => {
  getTimelineApi()?.moveTo(new Date(), { animation: true })
}

const zoomIn = () => {
  getTimelineApi()?.zoomIn(0.2)
}

const zoomOut = () => {
  getTimelineApi()?.zoomOut(0.2)
}

const toggleViewMode = () => {
  emit('update:viewMode', props.viewMode === 'month' ? 'quarter' : 'month')
}

const clearSelection = () => {
  getTimelineApi()?.setSelection([])
  emit('clear-selection')
}

const handleItemClick = (itemId: string) => {
  getTimelineApi()?.setSelection([itemId])
  getTimelineApi()?.focus(itemId)
  emit('select-item', itemId)
}

watch(
  () => props.viewMode,
  (mode) => {
    applyViewMode(mode)
  },
  { immediate: true },
)

watch(
  () => props.items,
  () => {
    fitTimeline()
  },
  { deep: true },
)

watch(
  () => props.selectedItemId,
  async (itemId) => {
    await nextTick()
    const api = getTimelineApi()
    if (!api) return

    if (!itemId) {
      api.setSelection([])
      return
    }

    api.setSelection([itemId])
    api.focus(itemId)
  },
  { immediate: true },
)

onMounted(async () => {
  await applyViewMode(props.viewMode)
  await fitTimeline()
})
</script>

<template>
  <section class="roadmap-wrapper">
    <header class="toolbar">
      <div class="toolbar-title">
        <p class="eyebrow">Interactive Timeline</p>
        <h2>로드맵 보기</h2>
        <span class="meta">그룹 {{ groupCount }} · 작업 {{ itemCount }}</span>
      </div>

      <div class="toolbar-actions">
        <button type="button" class="toolbar-button" @click="moveToToday">Today</button>
        <button type="button" class="toolbar-button" @click="fitTimeline">Fit</button>
        <button type="button" class="toolbar-button" @click="toggleViewMode">{{ modeLabel }}</button>
        <button type="button" class="toolbar-button" @click="zoomIn">+</button>
        <button type="button" class="toolbar-button" @click="zoomOut">−</button>
        <button type="button" class="toolbar-button danger" @click="clearSelection">Clear</button>
      </div>
    </header>

    <div class="timeline-surface">
      <TimelineView
        ref="timelineViewRef"
        :items="props.items"
        :groups="props.groups"
        theme-class="timeline-roadmap-theme"
        @item-click="handleItemClick"
      />
    </div>
  </section>
</template>

<style scoped>
.roadmap-wrapper {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100%;
  min-height: 680px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.9));
}

.toolbar-title h2 {
  margin: 0;
  color: #0f172a;
}

.eyebrow {
  margin: 0 0 6px;
  color: #4f46e5;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta {
  color: #64748b;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.toolbar-button {
  min-width: 54px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.toolbar-button:hover {
  background: #f8fafc;
}

.toolbar-button.danger {
  color: #b91c1c;
}

.timeline-surface {
  display: flex;
  min-height: 0;
  height: 100%;
  padding: 18px;
}

.timeline-surface :deep(.timeline-roadmap-theme) {
  width: 100%;
  height: 100%;
  min-height: 560px;
}

.timeline-surface :deep(.timeline-roadmap-theme.vis-timeline) {
  width: 100% !important;
  max-width: none !important;
  height: 100%;
  border: 1px solid #dbe2f0;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-panel.vis-left) {
  border-right: 1px solid #e2e8f0;
}

.timeline-surface :deep(.timeline-roadmap-theme .timeline-group-label) {
  width: 100%;
  max-width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
  background: transparent;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-item) {
  height: auto;
  min-height: 0;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-item .vis-item-content) {
  height: auto;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-panel.vis-left),
.timeline-surface :deep(.timeline-roadmap-theme .vis-panel.vis-top) {
  background: #f8fafc;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-labelset .vis-label) {
  border-color: #e2e8f0;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-item) {
  border: none;
  background: transparent;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-item-content) {
  padding: 0;
}

.timeline-surface :deep(.timeline-roadmap-theme .vis-current-time) {
  width: 3px;
  background: #2563eb;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>
