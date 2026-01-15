<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

// Background items (background 타입)
const items = [
  { id: 1, content: 'item 1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, content: 'item 2', start: '2020-08-19' },
  { id: 3, content: 'item 3', start: '2020-08-23', end: '2020-08-29' },
  // Background areas
  { id: 100, content: 'Background', start: '2020-08-18', end: '2020-08-22', type: 'background' },
  { id: 101, content: 'Holiday', start: '2020-08-24', end: '2020-08-26', type: 'background', className: 'holiday' },
]

onMounted(() => {
  if (timelineEl.value) {
    useTimeline(timelineEl.value, items)
  }
})
</script>

<template>
  <div class="background-areas-example">
    <p class="description">Background items are displayed as colored areas spanning the entire height</p>
    <div ref="timelineEl" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<style scoped>
.background-areas-example {
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

:global(.vis-item.background) {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
}

:global(.vis-item.background.holiday) {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgb(244, 63, 94);
}
</style>
