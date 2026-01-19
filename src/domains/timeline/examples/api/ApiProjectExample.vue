<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'
import { useTimelineProjectData } from '@/domains/timeline/composables/useTimelineProjectData'

const timelineEl = ref<HTMLDivElement>()
const detailsEl = ref<HTMLDivElement>()
const timeline = ref<any>(null)

const {
  loading,
  error,
  items,
  groups,
  selectedTaskDetail,
  selectedTaskDetailHtml,
  loadProject,
  selectTask,
  clearSelection,
  getTaskCountByGroup,
  getProgressStats,
} = useTimelineProjectData()

const stats = ref<any>(null)

const handleTimelineSelect = (properties: any) => {
  if (properties.items && properties.items.length > 0) {
    selectTask(properties.items[0])
  }
}

onMounted(async () => {
  // 프로젝트 데이터 로드
  await loadProject()

  // Timeline 초기화
  if (timelineEl.value && items.value.length > 0) {
    timeline.value = useTimeline(timelineEl.value, items.value)

    // 선택 이벤트 리스너
    timeline.value.on('select', handleTimelineSelect)
  }

  // 통계 계산
  stats.value = getProgressStats()
})
</script>

<template>
  <div class="api-project-example">
    <!-- Loading & Error States -->
    <div v-if="loading" class="state-message loading">
      <div class="spinner"></div>
      <span>Loading project data...</span>
    </div>

    <div v-if="error" class="state-message error">
      <span>⚠️ {{ error }}</span>
    </div>

    <!-- Main Content -->
    <div v-else-if="items.length > 0" class="content-layout">
      <!-- Sidebar with Statistics -->
      <aside class="sidebar">
        <!-- Statistics Card -->
        <div class="card stats-card">
          <h3>Project Statistics</h3>
          <div class="stat-item">
            <div class="stat-value">{{ stats?.completed }}</div>
            <div class="stat-label">✅ Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats?.inProgress }}</div>
            <div class="stat-label">🔄 In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats?.planning }}</div>
            <div class="stat-label">📋 Planning</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats?.onHold }}</div>
            <div class="stat-label">⏸️ On Hold</div>
          </div>
        </div>

        <!-- Groups Summary -->
        <div class="card">
          <h3>Teams</h3>
          <div class="groups-summary">
            <div v-for="group in groups" :key="group.id" class="group-summary">
              <div class="group-name">{{ group.content.replace(/<[^>]*>/g, '') }}</div>
              <div class="group-count">{{ getTaskCountByGroup(group.id) }} tasks</div>
            </div>
          </div>
        </div>

        <!-- Clear Selection Button -->
        <button
          v-if="selectedTaskDetail"
          @click="clearSelection"
          class="btn btn-secondary"
          style="width: 100%"
        >
          Clear Selection
        </button>
      </aside>

      <!-- Main Timeline Area -->
      <main class="main-content">
        <div class="timeline-container">
          <h2>Project Timeline</h2>
          <p class="hint">Click on any item to see details</p>
          <div ref="timelineEl" class="timeline"></div>
        </div>
      </main>

      <!-- Details Panel -->
      <aside class="details-panel">
        <div v-if="selectedTaskDetail" class="card">
          <h3>{{ selectedTaskDetail.title }}</h3>
          <div ref="detailsEl" class="task-details" v-html="selectedTaskDetailHtml"></div>
        </div>
        <div v-else class="card empty-state">
          <div style="text-align: center; color: #999; padding: 20px">
            <div style="font-size: 32px; margin-bottom: 8px">👆</div>
            <div>Select a task to view details</div>
          </div>
        </div>
      </aside>
    </div>

    <!-- No Data State -->
    <div v-else class="state-message">
      <span>📭 No project data available</span>
    </div>
  </div>
</template>

<style scoped>
.api-project-example {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* State Messages */
.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  font-size: 16px;
  color: #666;
}

.state-message.loading {
  gap: 16px;
}

.state-message.error {
  color: #dc2626;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Layout */
.content-layout {
  display: grid;
  grid-template-columns: 250px 1fr 320px;
  gap: 12px;
  padding: 12px;
  height: 100%;
}

@media (max-width: 1400px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .sidebar,
  .details-panel {
    display: none;
  }
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
}

.card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
}

/* Statistics */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.stats-card h3 {
  color: white;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

/* Groups Summary */
.groups-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-summary {
  background: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
}

.group-name {
  font-size: 13px;
  font-weight: 500;
}

.group-count {
  font-size: 11px;
  color: #999;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  overflow: hidden;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.timeline-container h2 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.hint {
  margin: 0 0 12px 0;
  color: #999;
  font-size: 12px;
}

.timeline {
  flex: 1;
  width: 100%;
}

/* Details Panel */
.details-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  overflow-y: auto;
  max-height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.task-details {
  font-size: 13px;
  line-height: 1.6;
}

/* Buttons */
.btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  background: white;
}

.btn:hover {
  background: #f3f4f6;
}

.btn-secondary {
  border-color: #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
