<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

// Point items (range 없이 시작 시간만 있음)
const items = [
  { id: 1, content: 'point item 1', start: '2020-08-18' },
  { id: 2, content: 'point item 2', start: '2020-08-20' },
  { id: 3, content: 'point item 3', start: '2020-08-23' },
  { id: 4, content: 'point item 4', start: '2020-08-25' },
  { id: 5, content: 'point item 5', start: '2020-08-28' },
  { id: 6, content: 'point item 6', start: '2020-09-01' },
]

onMounted(() => {
  if (timelineEl.value) {
    useTimeline(timelineEl.value, items)
  }
})
</script>

<template>
  <div class="point-items-example">
    <p class="description">Point items are displayed as points on the timeline (no end time)</p>
    <div ref="timelineEl" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<style scoped>
.point-items-example {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.description {
  padding: 12px;
  background: #eff6ff;
  border-left: 3px solid #0284c7;
  margin: 0 0 12px 0;
  color: #0c4a6e;
  font-size: 13px;
}
</style>
