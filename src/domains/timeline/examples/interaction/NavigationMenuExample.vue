<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()
let timeline: any

const items = [
  { id: 1, content: 'item 1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, content: 'item 2', start: '2020-08-19' },
  { id: 3, content: 'item 3', start: '2020-08-23', end: '2020-08-29' },
  { id: 4, content: 'item 4', start: '2020-08-23', end: '2020-09-02' },
  { id: 5, content: 'item 5', start: '2020-08-25', end: '2020-09-05' },
]

onMounted(() => {
  if (timelineEl.value) {
    timeline = useTimeline(timelineEl.value, items)
  }
})

const zoomInMore = () => {
  if (timeline) timeline.zoomIn(0.5)
}

const zoomIn = () => {
  if (timeline) timeline.zoomIn(0.2)
}

const zoomOut = () => {
  if (timeline) timeline.zoomOut(0.2)
}

const zoomOutMore = () => {
  if (timeline) timeline.zoomOut(0.5)
}

const movePrevious = () => {
  if (timeline) {
    const window = timeline.getWindow()
    const duration = window.end - window.start
    const newStart = new Date(window.start.getTime() - duration * 0.3)
    const newEnd = new Date(window.end.getTime() - duration * 0.3)
    timeline.setWindow(newStart, newEnd, { animation: true })
  }
}

const moveNext = () => {
  if (timeline) {
    const window = timeline.getWindow()
    const duration = window.end - window.start
    const newStart = new Date(window.start.getTime() + duration * 0.3)
    const newEnd = new Date(window.end.getTime() + duration * 0.3)
    timeline.setWindow(newStart, newEnd, { animation: true })
  }
}

const fitAll = () => {
  if (timeline) timeline.fit()
}
</script>

<template>
  <div class="navigation-menu-example">
    <div class="controls">
      <div class="button-group">
        <button @click="zoomInMore" title="Zoom in more">
          <span>⟳⟳</span>
        </button>
        <button @click="zoomIn" title="Zoom in">
          <span>⟳</span>
        </button>
        <button @click="zoomOut" title="Zoom out">
          <span>⟲</span>
        </button>
        <button @click="zoomOutMore" title="Zoom out more">
          <span>⟲⟲</span>
        </button>
      </div>

      <div class="button-group">
        <button @click="movePrevious" title="Move to previous">
          <span>◀</span>
        </button>
        <button @click="moveNext" title="Move to next">
          <span>▶</span>
        </button>
      </div>

      <div class="button-group">
        <button @click="fitAll" title="Fit all items">
          <span>◻</span>
        </button>
      </div>
    </div>

    <p class="hint">Use the navigation buttons to control the timeline view</p>

    <div ref="timelineEl" class="timeline-container"></div>
  </div>
</template>

<style scoped>
.navigation-menu-example {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.controls {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 4px;
  border-right: 1px solid #d1d5db;
  padding-right: 12px;
}

.button-group:last-child {
  border-right: none;
  padding-right: 0;
}

.controls button {
  padding: 8px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
  min-width: 36px;
}

.controls button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.hint {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 12px;
}

.timeline-container {
  flex: 1;
  width: 100%;
}
</style>
