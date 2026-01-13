<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTimeline } from '../composables/useTimeline'
import type { TimelineItem } from '../types'

const props = defineProps<{
  items: TimelineItem[]
}>()

const container = ref<HTMLDivElement | null>(null)
let timelineApi: ReturnType<typeof useTimeline>

onMounted(() => {
  if (!container.value) return
  timelineApi = useTimeline(container.value, props.items)
})

watch(
  () => props.items,
  (items) => {
    timelineApi?.setItems(items)
  }
)

onBeforeUnmount(() => {
  timelineApi?.destroy()
})
</script>

<template>
  <div ref="container" style="height: 400px;" />
</template>
