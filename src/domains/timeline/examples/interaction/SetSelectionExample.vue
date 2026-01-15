<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()
const selectionButtons = ref<{ id: string; content: string }[]>([])
let timeline: any

const items = [
  { id: 1, content: 'item 1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, content: 'item 2', start: '2020-08-19' },
  { id: 3, content: 'item 3', start: '2020-08-23', end: '2020-08-29' },
  { id: 4, content: 'item 4', start: '2020-08-23', end: '2020-09-02' },
]

onMounted(() => {
  if (timelineEl.value) {
    timeline = useTimeline(timelineEl.value, items)
    selectionButtons.value = items.map(item => ({
      id: String(item.id),
      content: item.content,
    }))
  }
})

const selectItem = (id: string) => {
  if (timeline) {
    timeline.setSelection([id])
    timeline.focus(id)
  }
}

const selectMultiple = () => {
  if (timeline) {
    timeline.setSelection([1, 3])
  }
}

const clearSelection = () => {
  if (timeline) {
    timeline.setSelection([])
  }
}
</script>

<template>
  <div class="set-selection-example">
    <div class="controls">
      <button v-for="item in selectionButtons" :key="item.id" @click="selectItem(item.id)">
        Select {{ item.content }}
      </button>
      <button @click="selectMultiple">Select Multiple (1, 3)</button>
      <button @click="clearSelection">Clear Selection</button>
    </div>
    <div ref="timelineEl" class="timeline-container"></div>
  </div>
</template>

<style scoped>
.set-selection-example {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.controls button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.timeline-container {
  flex: 1;
  width: 100%;
}
</style>
