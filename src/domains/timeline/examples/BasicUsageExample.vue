<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

const items = [
  { id: 1, content: 'item 1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, content: 'item 2', start: '2020-08-19' },
  { id: 3, content: 'item 3', start: '2020-08-23', end: '2020-08-29' },
  { id: 4, content: 'item 4', start: '2020-08-23', end: '2020-09-02' },
]

onMounted(() => {
  if (timelineEl.value) {
    useTimeline(timelineEl.value, items)
  }
})
</script>

<template>
  <div class="basic-usage-example">
    <div ref="timelineEl" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<style scoped>
.basic-usage-example {
  width: 100%;
  height: 100%;
}
</style>
