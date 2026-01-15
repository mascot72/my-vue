<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()
const isClickToUse = ref(true)
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
    updateClickToUse()
  }
})

const updateClickToUse = () => {
  if (timeline) {
    timeline.setOptions({ clickToUse: isClickToUse.value })
  }
}

const toggleClickToUse = () => {
  isClickToUse.value = !isClickToUse.value
  updateClickToUse()
}
</script>

<template>
  <div class="click-to-use-example">
    <div class="controls">
      <label class="toggle-label">
        <input v-model="isClickToUse" type="checkbox" @change="toggleClickToUse" />
        <span>Click to Use ({{ isClickToUse ? 'enabled' : 'disabled' }})</span>
      </label>
      <p class="description">
        {{ isClickToUse ? 'Click on the timeline to focus it' : 'Timeline is always interactive' }}
      </p>
    </div>
    <div ref="timelineEl" class="timeline-container"></div>
  </div>
</template>

<style scoped>
.click-to-use-example {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.controls {
  padding: 12px;
  background: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 12px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-label input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.description {
  margin: 8px 0 0 0;
  color: #6b7280;
  font-size: 12px;
}

.timeline-container {
  flex: 1;
  width: 100%;
}
</style>
