<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import TimelineWorkspaceNew from '@/domains/timeline/components/Roadmap/workspaceNew/Timeline.vue'
import { useWorkspaceNewTimelineStore } from '@/domains/timeline/components/Roadmap/workspaceNew/timeline.store'

const timelineRef = ref<InstanceType<typeof TimelineWorkspaceNew> | null>(null)
const selectedItem = ref<Record<string, unknown> | null>(null)
const store = useWorkspaceNewTimelineStore()
const { rootItems, items } = storeToRefs(store)

const summaryCards = computed(() => [
  { label: '제품 항목', value: rootItems.value.length },
  { label: '전체 표시', value: items.value.length },
  { label: '확장 가능', value: rootItems.value.filter((item) => Number(item.trmCount || 0) > 0).length },
])

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
  <div class="roadmap-workspace-new-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Roadmap Workspace New</p>
        <h1>Workspace New Timeline</h1>
        <p class="description">제품 아이템의 하위 필요기술 토글, 화살표 연결, 상세 패널을 새 API 기준으로 연결한 작업 화면입니다.</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost-button" @click="expandAll">전체 펼치기</button>
        <button type="button" class="ghost-button" @click="collapseAll">전체 접기</button>
        <button type="button" class="ghost-button" :disabled="!selectedItem" @click="focusSelected">선택 항목 포커스</button>
      </div>
    </header>

    <section class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card">
        <span class="summary-label">{{ card.label }}</span>
        <strong class="summary-value">{{ card.value }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <TimelineWorkspaceNew ref="timelineRef" @open-detail-slide="handleOpenDetail" />

      <aside class="details-panel">
        <div class="details-header">
          <div>
            <p class="eyebrow">Details</p>
            <h2>선택 항목 정보</h2>
          </div>
        </div>

        <div v-if="selectedItem" class="details-body">
          <dl>
            <div class="detail-row">
              <dt>ID</dt>
              <dd>{{ selectedItem.id }}</dd>
            </div>
            <div class="detail-row">
              <dt>제목</dt>
              <dd>{{ selectedItem.title }}</dd>
            </div>
            <div class="detail-row">
              <dt>유형</dt>
              <dd>{{ selectedItem.ptrmType }}</dd>
            </div>
            <div class="detail-row">
              <dt>그룹</dt>
              <dd>{{ selectedItem.group }}</dd>
            </div>
            <div class="detail-row">
              <dt>상태</dt>
              <dd>{{ selectedItem.itemStatusName || selectedItem.itemStatusCode }}</dd>
            </div>
            <div class="detail-row">
              <dt>영문명</dt>
              <dd>{{ selectedItem.titleEn }}</dd>
            </div>
            <div class="detail-row">
              <dt>기술분류</dt>
              <dd>{{ selectedItem.technologyClassLv3Name || '-' }}</dd>
            </div>
          </dl>
        </div>
        <div v-else class="empty-state">
          <strong>항목을 선택해 주세요.</strong>
          <p>타임라인 카드 클릭 시 여기에서 상세 정보를 확인할 수 있습니다.</p>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.roadmap-workspace-new-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
    linear-gradient(180deg, #f8fafc 0%, #eefbf3 100%);
}

.page-header,
.summary-card,
.details-panel {
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
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: #0f172a;
}

.description {
  margin: 8px 0 0;
  color: #475569;
  max-width: 720px;
  line-height: 1.6;
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.summary-card {
  border-radius: 20px;
  padding: 18px 20px;
}

.summary-label {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.summary-value {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 28px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 420px);
  gap: 20px;
  margin-top: 20px;
  min-height: 680px;
}

.details-panel {
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.details-header {
  padding: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.details-body {
  padding: 20px 24px;
}

.detail-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.detail-row dt {
  color: #64748b;
  font-weight: 600;
}

.detail-row dd {
  margin: 0;
  color: #0f172a;
  word-break: break-word;
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

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .roadmap-workspace-new-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
