<!--
  TimelineRoadmap.vue (target)
  
  출처: origin/TimelineRoadmap.vue
  
  역할: Timeline과 control UI를 통합
  - Timeline.vue 포함
  - 그룹 제어 버튼 (전체 펼치기/접기)
  - view mode 선택 버튼
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import Timeline from './Timeline.vue'

defineProps<{
  roadmapType?: string
  viewStatus?: {
    statusPlan?: boolean
    statusExec?: boolean
    statusNBiz?: boolean
  }
}>()
const timelineRef = ref<InstanceType<typeof Timeline> | null>(null)

// 제어 상태
const viewMode = ref<'MONTH' | 'QUARTER'>('QUARTER')

// 로드맵 view mode 순환
const viewModes = ['제품군', '기술분류체계', '공통기술유형']
const currentModeIndex = ref(0)

const currentMode = computed(() => viewModes[currentModeIndex.value])

const changeViewMode = () => {
  currentModeIndex.value = (currentModeIndex.value + 1) % viewModes.length
}

const toggleTimelineViewMode = () => {
  viewMode.value = viewMode.value === 'MONTH' ? 'QUARTER' : 'MONTH'
}

//그룹 제어
const expandAllGroups = () => {
  timelineRef.value?.toggleAllGroups(true)
}

const collapseAllGroups = () => {
  timelineRef.value?.toggleAllGroups(false)
}

const focusToday = () => {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0] ?? ''
  timelineRef.value?.focusItemById(dateStr)
}

const zoomIn = () => {
  console.log('Zoom in')
}

const zoomOut = () => {
  console.log('Zoom out')
}

defineExpose({
  expandAllGroups,
  collapseAllGroups,
  focusToday,
})
</script>

<template>
  <div class="timeline-roadmap">
    <!-- 타임라인 제어 헤더 -->
    <div class="roadmap-header">
      <!-- 로드맵 Tree 제어 -->
      <div class="header-section">
        <span class="section-label">로드맵 Tree</span>
        <div class="button-group">
          <button type="button" class="control-btn" title="전체 접기" @click="collapseAllGroups">
            ◀ 접기
          </button>
          <button type="button" class="control-btn" title="전체 펼치기" @click="expandAllGroups">
            펼치기 ▶
          </button>
        </div>
      </div>

      <!-- View Mode 선택 -->
      <div class="header-section">
        <button type="button" class="mode-btn" @click="changeViewMode">
          {{ currentMode }}
        </button>
      </div>

      <!-- 액션 버튼 -->
      <div class="header-section">
        <button type="button" class="control-btn today" title="오늘로 이동" @click="focusToday">
          🎯 Today
        </button>
        <button type="button" class="control-btn" title="월 보기" @click="toggleTimelineViewMode">
          {{ viewMode === 'MONTH' ? '월' : '분기' }}
        </button>
      </div>

      <!-- Zoom 제어 -->
      <div class="header-section zoom-controls">
        <button type="button" class="control-btn" title="확대" @click="zoomIn">⊕</button>
        <button type="button" class="control-btn" title="축소" @click="zoomOut">⊖</button>
      </div>
    </div>

    <!-- 타임라인 본체 -->
    <div class="timeline-container">
      <Timeline
        ref="timelineRef"
        :view-status="viewStatus"
        :view-mode="viewMode"
        msg="변경 이력"
      />
    </div>
  </div>
</template>

<style scoped>
.timeline-roadmap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

/* ── 헤더 ── */
.roadmap-header {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: #f8fafc;
  flex-wrap: wrap;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── 버튼 ── */
.control-btn {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  color: #0f172a;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn:hover {
  border-color: #64748b;
  background: #f1f5f9;
}

.control-btn.today {
  background: #dcfce7;
  border-color: #22c55e;
  color: #166534;
}

.control-btn.today:hover {
  background: #bbf7d0;
}

.mode-btn {
  padding: 8px 16px;
  border: 2px solid #0f172a;
  border-radius: 8px;
  background: white;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: #0f172a;
  color: white;
}

.button-group {
  display: flex;
  gap: 4px;
}

.zoom-controls {
  margin-left: auto;
}

/* ── 타임라인 컨테이너 ── */
.timeline-container {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .roadmap-header {
    gap: 12px;
  }

  .header-section {
    min-width: 100%;
  }

  .zoom-controls {
    margin-left: 0;
  }
}
</style>
