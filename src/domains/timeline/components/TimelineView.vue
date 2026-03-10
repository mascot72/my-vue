<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTimeline } from '../composables/useTimeline'
import type { TimelineItem } from '../types'
import type { TimelineGroup } from 'vis-timeline'

const props = withDefaults(
  defineProps<{
    items: TimelineItem[]
    groups?: TimelineGroup[]
    themeClass?: string
  }>(),
  {
    themeClass: 'timeline-default',
  }
)

const emit = defineEmits<{
  itemHover: [{ itemId: string | null; x: number; y: number }]
  itemClick: [itemId: string]
  groupClick: [groupId: string]
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

  // 클릭 이벤트 리스너 (그룹/아이템)
  timelineApi.on('click', (properties?: unknown) => {
    const eventProps = properties as { what?: string; group?: string | number; item?: string | number }
    
    // 그룹 레이블 영역을 클릭한 경우
    if (eventProps?.what === 'group-label' && eventProps?.group !== undefined) {
      emit('groupClick', String(eventProps.group))
    }
    
    // 아이템을 클릭한 경우
    if (eventProps?.what === 'item' && eventProps?.item !== undefined) {
      emit('itemClick', String(eventProps.item))
    }
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

// 외부에서 사용할 수 있도록 메서드 노출
defineExpose({
  focusOnItem: (start: Date, end: Date, options?: { animation?: boolean; duration?: number }) => {
    if (!timelineApi) return
    
    const animationOptions = {
      animation: options?.animation ?? true,
      duration: options?.duration ?? 1000,
    }
    
    timelineApi.setWindow(start, end, animationOptions)
  },
  setWindow: (start: Date | number, end: Date | number) => {
    timelineApi?.setWindow(start, end)
  },
  getApi: () => timelineApi,
})
</script>

<template>
  <div ref="container" :class="props.themeClass" style="width: 100%; height: 100%;" />
</template>
