<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

const items = [
  {
    id: 1,
    content: '<div style="color: #3b82f6; font-weight: bold;">HTML Content</div>',
    start: '2020-08-20',
    end: '2020-08-25',
  },
  {
    id: 2,
    content: '<div style="color: #059669;"><i>Styled Item</i></div>',
    start: '2020-08-19',
  },
  {
    id: 3,
    content:
      '<div style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); padding: 5px; color: white; border-radius: 3px;">Gradient</div>',
    start: '2020-08-23',
    end: '2020-08-29',
  },
  {
    id: 4,
    content:
      '<div style="text-align: center; padding: 10px;"><div style="font-size: 20px;">🎉</div><div>Event</div></div>',
    start: '2020-08-23',
    end: '2020-09-02',
  },
]

onMounted(() => {
  if (timelineEl.value) {
    useTimeline(timelineEl.value, items)
  }
})
</script>

<template>
  <div class="html-contents-example">
    <p class="description">Items can contain HTML content with custom styling</p>
    <div ref="timelineEl" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<style scoped>
.html-contents-example {
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
