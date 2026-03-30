<script setup lang="ts">
import { ref } from 'vue'
import TargetTimeline from '@/domains/timeline/components/Roadmap/target/Timeline.vue'

const timelineRef = ref<InstanceType<typeof TargetTimeline> | null>(null)
const selectedItem = ref<Record<string, unknown> | null>(null)

const handleOpenDetail = (item: Record<string, unknown>) => {
  selectedItem.value = item
}

const expandAll = () => timelineRef.value?.expandAllSubItems()
const collapseAll = () => timelineRef.value?.collapseAllSubItems()
const focusSelected = () => {
  if (!selectedItem.value?.id) return
  timelineRef.value?.focusItemById(String(selectedItem.value.id))
}
</script>

<template>
  <div class="roadmap-target-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Roadmap Target</p>
        <h1>Target Timeline</h1>
        <p class="description">origin 디자인과 workspaceNew 기능을 결합한 target 전용 로드맵 화면입니다.</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost-button" @click="expandAll">전체 펼치기</button>
        <button type="button" class="ghost-button" @click="collapseAll">전체 접기</button>
        <button type="button" class="ghost-button" :disabled="!selectedItem" @click="focusSelected">선택 항목 포커스</button>
      </div>
    </header>

    <section class="timeline-section">
      <TargetTimeline ref="timelineRef" msg="변경 이력" @open-detail-slide="handleOpenDetail" />
    </section>
  </div>
</template>

<style scoped>
.roadmap-target-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%);
}

.page-header,
.timeline-section {
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
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #0f172a;
}

.description {
  margin: 8px 0 0;
  color: #475569;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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

.ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timeline-section {
  border-radius: 24px;
  overflow: hidden;
  margin-top: 20px;
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .roadmap-target-page {
    padding: 16px;
  }
}
</style>
