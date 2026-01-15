<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

const items = [
  {
    id: 1,
    content: 'Item 1',
    start: '2020-08-20',
    end: '2020-08-25',
    title: 'First Timeline Event\n\nThis is a detailed tooltip\nwith multiple lines',
  },
  {
    id: 2,
    content: 'Item 2',
    start: '2020-08-19',
    title: 'Second Event\nHover for details',
  },
  {
    id: 3,
    content: 'Item 3',
    start: '2020-08-23',
    end: '2020-08-29',
    title: 'Extended timeline period\nwith rich information',
  },
  {
    id: 4,
    content: 'Item 4',
    start: '2020-08-23',
    end: '2020-09-02',
    title: 'Long running event\n📅 Duration: 10 days\n⏱️ Full month project',
  },
  {
    id: 5,
    content: 'Item 5',
    start: '2020-08-27',
    title: 'Quick event at 27th',
  },
]

onMounted(() => {
  if (timelineEl.value) {
    useTimeline(timelineEl.value, items)
  }
})
</script>

<template>
  <div class="tooltip-example">
    <p class="description">Hover over items to see tooltips with additional information</p>
    <div ref="timelineEl" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<style scoped>
.tooltip-example {
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
