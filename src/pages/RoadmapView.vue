<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TimelineRoadmap from '@/domains/timeline/components/Roadmap/TimelineRoadmap.vue'
import { useTimelineProjectData } from '@/domains/timeline/composables/useTimelineProjectData'

type StatusFilter = 'all' | 'planning' | 'in-progress' | 'completed' | 'on-hold'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical'
type ViewMode = 'month' | 'quarter'

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
  getProgressStats,
} = useTimelineProjectData()

const searchText = ref('')
const selectedGroupId = ref('all')
const statusFilter = ref<StatusFilter>('all')
const priorityFilter = ref<PriorityFilter>('all')
const hideCompleted = ref(false)
const viewMode = ref<ViewMode>('month')
const activeItemId = ref<number | null>(null)

const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

const groupOptions = computed(() =>
  groups.value.map((group) => ({
    value: String(group.id),
    label: stripHtml(String(group.content ?? group.title ?? group.id)),
  })),
)

const filteredItems = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const text = `${item.title ?? ''} ${stripHtml(String(item.content ?? ''))}`.toLowerCase()
    const matchesKeyword = keyword.length === 0 || text.includes(keyword)
    const matchesGroup = selectedGroupId.value === 'all' || String(item.group) === selectedGroupId.value
    const matchesStatus =
      statusFilter.value === 'all' || item.className?.includes(`status-${statusFilter.value}`)
    const matchesPriority =
      priorityFilter.value === 'all' || item.className?.includes(`priority-${priorityFilter.value}`)
    const matchesCompleted = !hideCompleted.value || !item.className?.includes('status-completed')

    return matchesKeyword && matchesGroup && matchesStatus && matchesPriority && matchesCompleted
  })
})

const filteredGroups = computed(() => {
  const visibleGroupIds = new Set(filteredItems.value.map((item) => String(item.group)))
  return groups.value.filter((group) => visibleGroupIds.has(String(group.id)))
})

const stats = computed(() => getProgressStats())
const visibleCount = computed(() => filteredItems.value.length)
const totalCount = computed(() => items.value.length)

const summaryCards = computed(() => [
  { label: '전체 작업', value: totalCount.value, tone: 'slate' },
  { label: '현재 표시', value: visibleCount.value, tone: 'blue' },
  { label: '진행 중', value: stats.value.inProgress, tone: 'indigo' },
  { label: '완료', value: stats.value.completed, tone: 'green' },
])

const resetFilters = () => {
  searchText.value = ''
  selectedGroupId.value = 'all'
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
  hideCompleted.value = false
}

const handleSelectItem = async (itemId: string) => {
  const nextId = Number(itemId)
  if (Number.isNaN(nextId)) return

  activeItemId.value = nextId
  await selectTask(nextId)
}

const handleClearSelection = () => {
  activeItemId.value = null
  clearSelection()
}

watch(filteredItems, (nextItems) => {
  if (!activeItemId.value) return

  const exists = nextItems.some((item) => Number(item.id) === activeItemId.value)
  if (!exists) {
    handleClearSelection()
  }
})

onMounted(async () => {
  await loadProject()
})
</script>

<template>
  <div class="roadmap-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Roadmap</p>
        <h1>Roadmap Timeline</h1>
        <p class="description">vis-timeline 기반 로드맵 화면을 현재 프로젝트 구조에 맞게 다시 연결했습니다.</p>
      </div>
      <div class="header-actions">
        <button type="button" class="ghost-button" @click="resetFilters">필터 초기화</button>
      </div>
    </header>

    <section class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card" :data-tone="card.tone">
        <span class="summary-label">{{ card.label }}</span>
        <strong class="summary-value">{{ card.value }}</strong>
      </article>
    </section>

    <section class="filter-panel">
      <label class="field wide">
        <span>검색</span>
        <input v-model="searchText" type="text" placeholder="작업명 또는 설명 검색" />
      </label>

      <label class="field">
        <span>그룹</span>
        <select v-model="selectedGroupId">
          <option value="all">전체</option>
          <option v-for="group in groupOptions" :key="group.value" :value="group.value">
            {{ group.label }}
          </option>
        </select>
      </label>

      <label class="field">
        <span>상태</span>
        <select v-model="statusFilter">
          <option value="all">전체</option>
          <option value="planning">Planning</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </label>

      <label class="field">
        <span>우선순위</span>
        <select v-model="priorityFilter">
          <option value="all">전체</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </label>

      <label class="checkbox-field">
        <input v-model="hideCompleted" type="checkbox" />
        <span>완료 항목 숨기기</span>
      </label>
    </section>

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
          @select-item="handleSelectItem"
          @clear-selection="handleClearSelection"
        />
      </div>

      <aside class="details-panel">
        <div class="details-header">
          <div>
            <p class="eyebrow">Details</p>
            <h2>선택 항목 정보</h2>
          </div>
          <button
            v-if="selectedTaskDetail"
            type="button"
            class="ghost-button small"
            @click="handleClearSelection"
          >
            선택 해제
          </button>
        </div>

        <div v-if="selectedTaskDetailHtml" class="details-body" v-html="selectedTaskDetailHtml"></div>
        <div v-else class="empty-state">
          <strong>항목을 선택해 주세요.</strong>
          <p>타임라인 카드 클릭 시 상세 정보를 오른쪽 패널에서 확인할 수 있습니다.</p>
        </div>
      </aside>
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

.page-header,
.summary-card,
.filter-panel,
.timeline-panel,
.details-panel,
.feedback {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  border-radius: 24px;
  padding: 24px 28px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1,
.details-header h2 {
  margin: 0;
  color: #0f172a;
}

.description {
  margin: 8px 0 0;
  color: #475569;
  max-width: 720px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.summary-card {
  border-radius: 20px;
  padding: 18px 20px;
}

.summary-card[data-tone='blue'] {
  border-color: rgba(59, 130, 246, 0.2);
}

.summary-card[data-tone='indigo'] {
  border-color: rgba(79, 70, 229, 0.2);
}

.summary-card[data-tone='green'] {
  border-color: rgba(16, 185, 129, 0.2);
}

.summary-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  color: #0f172a;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(3, minmax(160px, 1fr)) auto;
  gap: 16px;
  margin-top: 20px;
  border-radius: 24px;
  padding: 20px;
}

.field,
.checkbox-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span,
.checkbox-field span {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.field input,
.field select {
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #0f172a;
}

.checkbox-field {
  justify-content: flex-end;
  flex-direction: row;
  align-items: center;
  padding-top: 28px;
}

.feedback {
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

.timeline-panel,
.details-panel {
  border-radius: 24px;
  overflow: hidden;
}

.timeline-panel {
  min-height: 680px;
}

.details-panel {
  display: flex;
  flex-direction: column;
}

.details-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.details-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
}

.empty-state {
  display: grid;
  place-items: center;
  text-align: center;
  gap: 8px;
  color: #64748b;
  min-height: 240px;
  padding: 24px;
}

.ghost-button {
  height: 42px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: white;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}

.ghost-button.small {
  height: 36px;
  padding: 0 12px;
}

.ghost-button:hover {
  background: #f8fafc;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .checkbox-field {
    justify-content: flex-start;
    padding-top: 0;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .roadmap-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .summary-grid,
  .filter-panel {
    grid-template-columns: 1fr;
  }
}
</style>
