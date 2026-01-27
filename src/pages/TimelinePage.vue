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
  <div class="timeline-page">
    <div class="timeline-header">
      <h2>Timeline Demo</h2>
    </div>

    <div class="timeline-content">
      <TimelineView
        v-if="!store.loading"
        :items="store.items"
      />
      <div v-else class="loading-state">
        <div class="spinner"></div>
        <span>Loading timeline...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.timeline-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.timeline-content {
  flex: 1;
  overflow: auto;
  padding: 2rem;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: #6b7280;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .timeline-header {
    padding: 1rem;
  }

  .timeline-content {
    padding: 1rem;
  }
}
</style>
