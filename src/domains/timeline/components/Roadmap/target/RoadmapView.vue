<!--
  RoadmapView.vue (target)
  
  출처: origin/latestRmView.vue
  
  종속성 구조: RoadmapView.vue -> TimelineRoadmap.vue -> Timeline.vue
  
  변경사항:
  - dxplm-* 컴포넌트 → 표준 HTML/Vue로 전환
  - 검색, 필터 UI 간소화 (MVP 범위)
  - roadmap view 화면 구성
-->

<script setup lang="ts">
import { ref, reactive } from 'vue'
import TimelineRoadmap from './TimelineRoadmap.vue'

const timelineRoadmapRef = ref<InstanceType<typeof TimelineRoadmap> | null>(null)

// 필터 상태
const filterState = reactive({
  roadmapType: 'PRM', // TES.ROADMAP_TYPE: PRM, TRM, CMM, COM
  statusCode: '', // TES.ROAD_STATUS
  organizations: [] as string[],
})

// 상태 표시 필터
const viewStatus = reactive({
  statusPlan: true,
  statusExec: true,
  statusNBiz: true,
})

// UI 상태
const isAdminPanelOpen = ref(false)

const toggleAdminPanel = () => {
  isAdminPanelOpen.value = !isAdminPanelOpen.value
}

const handleSearch = () => {
  // 검색 로직 (API 호출 등)
  console.log('Search with filters:', filterState)
}

const handleReset = () => {
  filterState.statusCode = ''
  filterState.organizations = []
}
</script>

<template>
  <div class="roadmap-view-page">
    <!-- 페이지 헤더 -->
    <header class="page-header">
      <div class="header-content">
        <h1>로드맵 조회</h1>
        <p class="description">제품 및 기술 로드맵 현황을 조회합니다</p>
      </div>

      <!-- 액션 버튼 -->
      <div class="header-actions">
        <button type="button" class="btn btn-secondary">결재상신</button>
        <button type="button" class="btn btn-secondary">로드맵 작성요청</button>
        <div class="admin-panel-wrapper">
          <button
            type="button"
            class="btn btn-primary"
            @click="toggleAdminPanel"
          >
            등록
            <span class="arrow" :class="{ open: isAdminPanelOpen }">▼</span>
          </button>
          <div v-if="isAdminPanelOpen" class="admin-panel">
            <button type="button" class="btn btn-sm">제품 Item 등록</button>
            <button type="button" class="btn btn-sm">필요기술 등록</button>
            <button type="button" class="btn btn-sm" disabled>로드맵 과제 계획 등록</button>
          </div>
        </div>
      </div>
    </header>

    <!-- 검색/필터 섹션 -->
    <section class="search-section">
      <div class="search-row">
        <div class="search-item">
          <label class="search-label">로드맵 구분</label>
          <select v-model="filterState.roadmapType" class="search-input">
            <option value="PRM">제품 Roadmap</option>
            <option value="TRM">기술 Roadmap</option>
            <option value="CMM">Components Roadmap</option>
            <option value="COM">Common Roadmap</option>
          </select>
        </div>
        <div class="search-item">
          <label class="search-label">진행상태</label>
          <select v-model="filterState.statusCode" class="search-input">
            <option value="">전체</option>
            <option value="code003">정상</option>
            <option value="code004">Hold</option>
            <option value="code005">Drop</option>
          </select>
        </div>
      </div>

      <!-- 상태 표시 필터 -->
      <div class="status-filter">
        <label class="filter-checkbox">
          <input v-model="viewStatus.statusPlan" type="checkbox" />
          <span>과제계획</span>
        </label>
        <label class="filter-checkbox">
          <input v-model="viewStatus.statusExec" type="checkbox" />
          <span>과제실행</span>
        </label>
        <label class="filter-checkbox">
          <input v-model="viewStatus.statusNBiz" type="checkbox" />
          <span>신사업</span>
        </label>
      </div>

      <div class="search-actions">
        <button type="button" class="btn btn-primary" @click="handleSearch">검색</button>
        <button type="button" class="btn btn-secondary" @click="handleReset">초기화</button>
      </div>
    </section>

    <!-- 타임라인 영역 -->
    <section class="timeline-section">
      <TimelineRoadmap
        ref="timelineRoadmapRef"
        :roadmap-type="filterState.roadmapType"
        :view-status="viewStatus"
      />
    </section>
  </div>
</template>

<style scoped>
.roadmap-view-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%);
}

/* ── 페이지 헤더 ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 20px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.description {
  margin: 8px 0 0;
  color: #475569;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

/* ── 버튼 스타일 ── */
.btn {
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  color: #0f172a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  border-color: #64748b;
  background: #f1f5f9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

.btn-primary:hover {
  background: #1e293b;
  border-color: #1e293b;
}

.btn-secondary {
  background: #f8fafc;
  color: #0f172a;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* ── 관리자 패널 ── */
.admin-panel-wrapper {
  position: relative;
}

.arrow {
  display: inline-block;
  margin-left: 6px;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.admin-panel {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 180px;
  overflow: hidden;
}

.admin-panel .btn {
  margin: 0;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #f1f5f9;
  background: transparent;
  text-align: left;
  padding: 8px 16px;
}

.admin-panel .btn:last-child {
  border-bottom: none;
}

.admin-panel .btn:hover {
  background: #f1f5f9;
  border: none;
}

/* ── 검색/필터 섹션 ── */
.search-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.search-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  color: #0f172a;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}

/* ── 상태 필터 ── */
.status-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #475569;
}

.filter-checkbox input {
  cursor: pointer;
}

/* ── 검색 액션 ── */
.search-actions {
  display: flex;
  gap: 12px;
}

/* ── 타임라인 섹션 ── */
.timeline-section {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .roadmap-view-page {
    padding: 16px;
  }

  .page-header {
    padding: 20px 16px;
  }

  .search-row {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
