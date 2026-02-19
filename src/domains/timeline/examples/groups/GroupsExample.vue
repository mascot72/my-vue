<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'

const timelineEl = ref<HTMLDivElement>()

const items = [
  // Group 1
  { id: 1, group: 1, content: 'Task 1.1', start: '2020-08-20', end: '2020-08-25' },
  { id: 2, group: 1, content: 'Task 1.2', start: '2020-08-19', end: '2020-08-21' },

  // Group 2
  { id: 3, group: 2, content: 'Task 2.1', start: '2020-08-23', end: '2020-08-29' },
  { id: 4, group: 2, content: 'Task 2.2', start: '2020-08-23', end: '2020-09-02' },

  // Group 3
  { id: 5, group: 3, content: 'Task 3.1', start: '2020-08-25', end: '2020-08-30' },
  { id: 6, group: 3, content: 'Task 3.2', start: '2020-08-27', end: '2020-09-01' },
]

const groups = [
  { id: 1, content: 'Team A', title: 'Development Team' },
  { id: 2, content: 'Team B', title: 'Design Team' },
  { id: 3, content: 'Team C', title: 'QA Team' },
]

onMounted(() => {
  if (timelineEl.value) {
    const timeline = useTimeline(timelineEl.value, items)
    timeline.setGroups(groups)
    // Groups를 설정 (vis-timeline에서 지원하는 경우)
    // setGroups 메서드가 있으면 호출
  }
})
</script>

<template>
  <div class="groups-example">
    <p class="description">
      Items are organized by groups (teams/resources). Each group has its own row.
    </p>
    <div ref="timelineEl" style="width: 100%; height: 100%">
      <img src="@/assets/images/image.png" width="100px" alt="Groups Example" />
    </div>
  </div>
</template>

<style scoped>
.groups-example {
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
