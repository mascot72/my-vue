<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()
const status = ref('')
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
  }
})

const animateTo = (duration: number, targetDays: number) => {
  if (!timeline) return

  status.value = `Animating for ${duration}ms...`

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3)
  const end = new Date(start.getTime() + targetDays * 24 * 60 * 60 * 1000)

  const startTime = Date.now()
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentStart = new Date(start.getTime() + (end.getTime() - start.getTime()) * progress * 0.5)
    const currentEnd = new Date(currentStart.getTime() + (end.getTime() - start.getTime()) * (1 - progress * 0.5))

    timeline.setWindow(currentStart, currentEnd, { animation: false })

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      status.value = 'Animation complete'
      setTimeout(() => {
        status.value = ''
      }, 2000)
    }
  }

  animate()
}

const fitWindow = () => {
  if (timeline) {
    timeline.fit()
    status.value = 'Fitted to all items'
    setTimeout(() => {
      status.value = ''
    }, 1500)
  }
}
</script>

<template>
  <div class="animate-window-example">
    <div class="controls">
      <button @click="animateTo(1000, 14)">Animate (1s, 14 days)</button>
      <button @click="animateTo(2000, 30)">Animate (2s, 30 days)</button>
      <button @click="fitWindow">Fit Window</button>
      <span v-if="status" class="status">{{ status }}</span>
    </div>
    <div ref="timelineEl" class="timeline-container"></div>
  </div>
</template>

<style scoped>
.animate-window-example {
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
  align-items: center;
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

.status {
  font-size: 12px;
  color: #059669;
  font-weight: 500;
}

.timeline-container {
  flex: 1;
  width: 100%;
}
</style>
