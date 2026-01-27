<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useTimeline } from '@/domains/timeline/composables/useTimeline'
import { useTimelineProjectData } from '@/domains/timeline/composables/useTimelineProjectData'

const timelineEl = ref<HTMLDivElement>()
const detailsEl = ref<HTMLDivElement>()
const timeline = ref<ReturnType<typeof useTimeline> | null>(null)

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

const stats = ref<any>({
  completed: 0,
  inProgress: 0,
  planning: 0,
  onHold: 0,
})
const isTimelineInitialized = ref(false)

const handleTimelineSelect = (properties: any) => {
  if (properties.items && properties.items.length > 0) {
    selectTask(properties.items[0])
  }
}

const initializeTimeline = () => {
  if (timelineEl.value && !isTimelineInitialized.value) {
    // 빈 데이터로 Timeline 초기화
    timeline.value = useTimeline(timelineEl.value, [])
    
    // 선택 이벤트 리스너
    timeline.value.on('select', handleTimelineSelect)
    
    isTimelineInitialized.value = true
  }
}

const updateTimelineData = () => {
  if (timeline.value && items.value.length > 0) {
    // Timeline에 데이터 업데이트
    timeline.value.setItems(items.value)
    
    // Groups가 있으면 설정
    if (groups.value.length > 0) {
      timeline.value.setGroups(groups.value)
    }
    
    // 통계 계산
    stats.value = getProgressStats()
    
    // Timeline 범위를 데이터에 맞게 조정
    timeline.value.fit()
  }
}

const handleRetry = async () => {
  error.value = null
  await loadProject()
}

// items가 변경될 때 timeline 업데이트
watch(items, (newItems) => {
  if (newItems.length > 0 && isTimelineInitialized.value) {
    updateTimelineData()
  }
})

onMounted(async () => {
  // 1. Timeline을 먼저 초기화 (빈 상태로 UI 표시)
  initializeTimeline()
  
  // 2. 비동기로 프로젝트 데이터 로드 (동시에 진행)
  loadProject()
})
</script>

<template>
  <div class="api-project-example">
    <!-- Main Content (항상 표시) -->
    <div class="content-layout">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-content">
          <div class="spinner"></div>
          <span>Loading project data...</span>
        </div>
      </div>
      <!-- Sidebar with Statistics -->
      <aside class="sidebar">
        <!-- Statistics Card -->
        <div class="card stats-card">
          <h3>Project Statistics</h3>
          <div class="stat-item">
            <div class="stat-value">{{ stats.completed || 0 }}</div>
            <div class="stat-label">✅ Completed</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.inProgress || 0 }}</div>
            <div class="stat-label">🔄 In Progress</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.planning || 0 }}</div>
            <div class="stat-label">📋 Planning</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.onHold || 0 }}</div>
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
          <p class="hint">
            <span v-if="items.length === 0 && !loading">No data yet - waiting for project data...</span>
            <span v-else>Click on any item to see details</span>
          </p>
          <div ref="timelineEl" class="timeline"></div>
          
          <!-- Error notification (doesn't hide timeline) -->
          <div v-if="error" class="error-notification">
            <span>⚠️ {{ error }}</span>
            <div class="error-actions">
              <button @click="handleRetry" class="retry-btn">Retry</button>
              <button @click="error = null" class="close-btn">✕</button>
            </div>
          </div>
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
  </div>
</template>

<style scoped>
.api-project-example {
  width: 1700px;
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

.state-message.error {
  color: #dc2626;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  font-size: 16px;
  color: #666;
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

/* Layout */
.content-layout {
  position: relative;
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
  position: relative;
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

/* Error Notification */
.error-notification {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 100;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.error-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.retry-btn:hover {
  background: #b91c1c;
}

.close-btn {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(220, 38, 38, 0.1);
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
