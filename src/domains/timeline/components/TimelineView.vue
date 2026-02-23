<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTimeline } from '../composables/useTimeline'
import type { TimelineItem } from '../types'
import type { TimelineGroup } from 'vis-timeline'

const props = defineProps<{
  items: TimelineItem[]
  groups?: TimelineGroup[]
}>()

const emit = defineEmits<{
  itemHover: [{ itemId: string | null; x: number; y: number }]
}>()

const container = ref<HTMLDivElement | null>(null)
let timelineApi: ReturnType<typeof useTimeline>

onMounted(() => {
  if (!container.value) return
  timelineApi = useTimeline(container.value, props.items, props.groups)

  // 마우스 오버 이벤트 리스너
  timelineApi.on('itemover', (properties?: unknown) => {
    const eventProps = properties as { event?: MouseEvent; item?: number | string }
    if (eventProps?.event && eventProps?.item !== undefined) {
      emit('itemHover', {
        itemId: String(eventProps.item),
        x: eventProps.event.clientX,
        y: eventProps.event.clientY,
      })
    }
  })

  // 마우스 아웃 이벤트 리스너
  timelineApi.on('itemout', () => {
    emit('itemHover', { itemId: null, x: 0, y: 0 })
  })
})

watch(
  () => props.items,
  (items) => {
    timelineApi?.setItems(items)
  }
)

watch(
  () => props.groups,
  (groups) => {
    if (groups) {
      timelineApi?.setGroups(groups)
    }
  }
)

onBeforeUnmount(() => {
  timelineApi?.destroy()
})
</script>

<template>
  <div ref="container" style="width: 100%; height: 100%;" />
</template>
