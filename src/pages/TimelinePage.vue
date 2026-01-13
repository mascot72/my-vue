<script setup lang="ts">
import { onMounted } from 'vue'
import { useTimelineStore } from '@/domains/timeline/store/timeline.store'
import TimelineView from '@/domains/timeline/components/TimelineView.vue'

const store = useTimelineStore()

onMounted(() => {
  store.load()
})
</script>

<template>
  <div>
    <h2>Timeline Demo</h2>

    <TimelineView
      v-if="!store.loading"
      :items="store.items"
    />
  </div>
</template>
