<script setup lang="ts">
import { onMounted } from 'vue'
import TimelineRoadmap from '@/domains/timeline/components/Roadmap/TimelineRoadmap.vue'
import RoadmapHeaderSection from '@/domains/timeline/components/roadmap-page/RoadmapHeaderSection.vue'
import RoadmapFilterPanel from '@/domains/timeline/components/roadmap-page/RoadmapFilterPanel.vue'
import RoadmapDetailsPanel from '@/domains/timeline/components/roadmap-page/RoadmapDetailsPanel.vue'
import { useRoadmapViewModel } from '@/domains/timeline/composables/useRoadmapViewModel'

const {
  loading,
  error,
  selectedTaskDetail,
  selectedTaskDetailHtml,
  groupOptions,
  filteredItems,
  filteredGroups,
  summaryCards,
  searchText,
  selectedGroupId,
  statusFilter,
  priorityFilter,
  hideCompleted,
  viewMode,
  activeItemId,
  resetFilters,
  selectRoadmapItem,
  clearRoadmapSelection,
  initialize,
} = useRoadmapViewModel()

onMounted(async () => {
  await initialize()
})
</script>

<template>
  <div class="roadmap-page">
    <RoadmapHeaderSection :summary-cards="summaryCards" @reset="resetFilters" />

    <RoadmapFilterPanel
      :search-text="searchText"
      :selected-group-id="selectedGroupId"
      :status-filter="statusFilter"
      :priority-filter="priorityFilter"
      :hide-completed="hideCompleted"
      :group-options="groupOptions"
      @update:search-text="searchText = $event"
      @update:selected-group-id="selectedGroupId = $event"
      @update:status-filter="statusFilter = $event"
      @update:priority-filter="priorityFilter = $event"
      @update:hide-completed="hideCompleted = $event"
    />

    <div v-if="error" class="feedback error">{{ error }}</div>
    <div v-else-if="loading" class="feedback">로드맵 데이터를 불러오는 중입니다...</div>

    <section v-else class="content-grid">
      <div class="timeline-panel">
        <TimelineRoadmap
          :items="filteredItems"
          :groups="filteredGroups"
          :view-mode="viewMode"
          :selected-item-id="activeItemId ? String(activeItemId) : null"
          @update:view-mode="viewMode = $event"
          @select-item="selectRoadmapItem"
          @clear-selection="clearRoadmapSelection"
        />
      </div>

      <RoadmapDetailsPanel
        :selected-task-detail="selectedTaskDetail"
        :selected-task-detail-html="selectedTaskDetailHtml"
        @clear="clearRoadmapSelection"
      />
    </section>
  </div>
</template>

<style scoped>
.roadmap-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}

.feedback {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  margin-top: 20px;
  border-radius: 20px;
  padding: 18px 20px;
  color: #334155;
}

.feedback.error {
  color: #b91c1c;
  border-color: rgba(220, 38, 38, 0.25);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 420px);
  gap: 20px;
  margin-top: 20px;
  min-height: 680px;
}

.timeline-panel {
  display: flex;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  overflow: hidden;
}

.timeline-panel {
  height: 100%;
  min-height: 680px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .roadmap-page {
    padding: 16px;
  }
}
</style>
