<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()
const events = ref<string[]>([])
let timeline: any

const items = [
  { id: 1, content: 'item 1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, content: 'item 2', start: '2020-08-19' },
  { id: 3, content: 'item 3', start: '2020-08-23', end: '2020-08-29' },
]

const addEvent = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  events.value.unshift(`[${timestamp}] ${message}`)
  if (events.value.length > 20) {
    events.value.pop()
  }
}

onMounted(() => {
  if (timelineEl.value) {
    timeline = useTimeline(timelineEl.value, items)

    timeline.on('select', (properties: any) => {
      addEvent(`Selected: ${properties.items.join(', ') || 'none'}`)
    })

    timeline.on('click', (properties: any) => {
      addEvent(`Clicked at ${new Date(properties.time).toLocaleDateString()}`)
    })

    timeline.on('doubleClick', (properties: any) => {
      addEvent(`Double clicked on item ${properties.item}`)
    })

    timeline.on('changed', (properties: any) => {
      addEvent(`Timeline changed: ${properties.byDomEvent ? 'by user interaction' : 'programmatically'}`)
    })
  }
})

const clearEvents = () => {
  events.value = []
}
</script>

<template>
  <div class="event-listeners-example">
    <div class="layout">
      <div class="timeline-section">
        <h3>Interactive Timeline</h3>
        <p style="color: #6b7280; font-size: 12px; margin: 0 0 12px 0;">Click, double-click, or interact with items</p>
        <div ref="timelineEl" class="timeline-container"></div>
      </div>

      <div class="events-section">
        <div class="events-header">
          <h3>Events Log</h3>
          <button @click="clearEvents" class="clear-btn">Clear</button>
        </div>
        <div class="events-list">
          <div v-if="events.length === 0" class="no-events">No events yet</div>
          <div v-for="(event, idx) in events" :key="idx" class="event-item">
            {{ event }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-listeners-example {
  width: 100%;
  height: 100%;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 12px;
  height: 100%;
}

.timeline-section {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
}

.timeline-section h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.timeline-container {
  flex: 1;
  width: 100%;
}

.events-section {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.events-header h3 {
  margin: 0;
  font-size: 14px;
}

.clear-btn {
  padding: 4px 8px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
}

.clear-btn:hover {
  background: #f3f4f6;
}

.events-list {
  flex: 1;
  overflow-y: auto;
  font-size: 11px;
  font-family: monospace;
  padding: 0;
}

.event-item {
  padding: 6px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-events {
  padding: 12px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
}
</style>
