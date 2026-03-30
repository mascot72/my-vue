<!--
  RoadmapDetailsPanel.vue (target)

  출처: origin/ItemDetailSlide.vue

  변경 내용:
  - dxplm-drawer → CSS slide panel (transform translateX)
  - dxplm-* UI 컴포넌트 → 표준 HTML 요소로 전환
  - 탭 구조 유지: 기본정보 / 일정정보 / 목표정보 / 제품정보 / 개발Site정보 / 필요기술정보 / 이력
  - TypeScript props + emit
  - Teleport(body)로 z-index 독립
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

interface DetailItem {
  id?: string | number
  title?: string
  titleEn?: string
  organizationNm?: string
  ptrmType?: string
  itemStatusCode?: string
  itemStatusName?: string
  validityStatus?: string
  validityStatusNm?: string
  writingStatus?: string
  writingStatusNm?: string
  groupPath?: string[]
  technologyClassLv1Name?: string
  technologyClassLv2Name?: string
  technologyClassLv3Name?: string
  customerCode?: string
  carModel?: string
  sopPlanMonth?: string
  start?: string | Date
  end?: string | Date
  updateDate?: string
  lastApprovalDate?: string | null
  description?: string
  developmentSite?: string
  relatedTechs?: string[]
  history?: Array<{
    date: string
    author: string
    summary: string
  }>
  [key: string]: unknown
}

const props = defineProps<{
  show: boolean
  itemData: DetailItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const TAB_KEYS = ['기본정보', '일정정보', '목표정보', '제품정보', '개발Site정보', '필요기술정보', '이력'] as const
type TabKey = (typeof TAB_KEYS)[number]

const activeTab = ref<TabKey>('기본정보')

const levelPath = computed(() => {
  const item = props.itemData
  if (!item) return ''
  return (item.groupPath ?? []).join(' > ')
})

const formatDate = (val: string | Date | null | undefined) => {
  if (!val) return '-'
  const d = val instanceof Date ? val : new Date(String(val))
  if (isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
</script>

<template>
  <Teleport to="body">
    <transition name="slide-panel">
      <div v-if="show && itemData" class="details-panel-overlay" @click.self="emit('close')">
        <aside class="details-panel">
          <!-- 패널 헤더 -->
          <header class="panel-header">
            <div class="header-title">
              <span class="header-ptype">{{ itemData.ptrmType ?? '' }}</span>
              <h2 class="header-name">{{ itemData.title || '-' }}</h2>
            </div>
            <button type="button" class="close-btn" title="닫기" @click="emit('close')">✕</button>
          </header>

          <!-- 탭 바 -->
          <nav class="tab-bar">
            <button
              v-for="tab in TAB_KEYS"
              :key="tab"
              type="button"
              :class="['tab-btn', { active: activeTab === tab }]"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </nav>

          <!-- 탭 컨텐츠 -->
          <div class="panel-body">
            <!-- ① 기본정보 -->
            <template v-if="activeTab === '기본정보'">
              <section class="info-section">
                <h3 class="section-title">기본 정보</h3>
                <div class="info-grid">
                  <div class="field">
                    <span class="field-label">조직</span>
                    <span class="field-value">{{ itemData.organizationNm || '-' }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">로드맵 유형</span>
                    <span class="field-value">{{ itemData.ptrmType || '-' }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">아이템 상태</span>
                    <span class="field-value">{{ itemData.itemStatusName || itemData.itemStatusCode || '-' }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">유효성 상태</span>
                    <span class="field-value">{{ itemData.validityStatusNm || itemData.validityStatus || '-' }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">작성 상태</span>
                    <span class="field-value">{{ itemData.writingStatusNm || itemData.writingStatus || '-' }}</span>
                  </div>
                  <div class="field full">
                    <span class="field-label">그룹 경로</span>
                    <span class="field-value">{{ levelPath || '-' }}</span>
                  </div>
                  <div v-if="itemData.titleEn" class="field full">
                    <span class="field-label">영문명</span>
                    <span class="field-value">{{ itemData.titleEn }}</span>
                  </div>
                  <div v-if="itemData.description" class="field full">
                    <span class="field-label">설명</span>
                    <span class="field-value desc">{{ itemData.description }}</span>
                  </div>
                </div>
              </section>
            </template>

            <!-- ② 일정정보 -->
            <template v-else-if="activeTab === '일정정보'">
              <section class="info-section">
                <h3 class="section-title">일정 정보</h3>
                <div class="info-grid">
                  <template v-if="itemData.ptrmType === 'PRM'">
                    <div class="field">
                      <span class="field-label">양산계획월</span>
                      <span class="field-value">{{ formatDate(itemData.sopPlanMonth) }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <div class="field">
                      <span class="field-label">개발착수 계획월</span>
                      <span class="field-value">{{ formatDate(itemData.start) }}</span>
                    </div>
                    <div class="field">
                      <span class="field-label">개발종료 계획월</span>
                      <span class="field-value">{{ formatDate(itemData.end) }}</span>
                    </div>
                  </template>
                  <div class="field">
                    <span class="field-label">최종 변경일</span>
                    <span class="field-value">{{ formatDate(itemData.updateDate) }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">최종 변경 승인일</span>
                    <span class="field-value">{{ formatDate(itemData.lastApprovalDate) }}</span>
                  </div>
                </div>
              </section>
            </template>

            <!-- ③ 목표정보 -->
            <template v-else-if="activeTab === '목표정보'">
              <section class="info-section">
                <h3 class="section-title">목표 정보</h3>
                <p class="empty-msg">목표 정보 내용은 별도 API 연동 필요</p>
              </section>
            </template>

            <!-- ④ 제품정보 (PRM) -->
            <template v-else-if="activeTab === '제품정보'">
              <section class="info-section">
                <h3 class="section-title">제품 정보</h3>
                <template v-if="itemData.ptrmType === 'PRM'">
                  <div class="info-grid">
                    <div class="field">
                      <span class="field-label">OEM</span>
                      <span class="field-value">{{ itemData.customerCode || '-' }}</span>
                    </div>
                    <div class="field">
                      <span class="field-label">차종</span>
                      <span class="field-value">{{ itemData.carModel || '-' }}</span>
                    </div>
                  </div>
                </template>
                <p v-else class="empty-msg">PRM 유형에서만 제공됩니다.</p>
              </section>
            </template>

            <!-- ⑤ 개발Site정보 -->
            <template v-else-if="activeTab === '개발Site정보'">
              <section class="info-section">
                <h3 class="section-title">개발 Site 정보</h3>
                <p class="field-value">{{ itemData.developmentSite || '-' }}</p>
              </section>
            </template>

            <!-- ⑥ 필요기술정보 -->
            <template v-else-if="activeTab === '필요기술정보'">
              <section class="info-section">
                <h3 class="section-title">필요 기술 정보</h3>
                <ul v-if="itemData.relatedTechs?.length" class="tech-list">
                  <li v-for="(tech, i) in itemData.relatedTechs" :key="i">{{ tech }}</li>
                </ul>
                <p v-else class="empty-msg">연결된 필요기술 정보가 없습니다.</p>
              </section>
            </template>

            <!-- ⑦ 이력 -->
            <template v-else-if="activeTab === '이력'">
              <section class="info-section">
                <h3 class="section-title">변경 이력</h3>
                <table v-if="itemData.history?.length" class="history-table">
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>작성자</th>
                      <th>내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(h, i) in itemData.history" :key="i">
                      <td>{{ h.date }}</td>
                      <td>{{ h.author }}</td>
                      <td>{{ h.summary }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-else class="empty-msg">변경 이력이 없습니다.</p>
              </section>
            </template>
          </div>
        </aside>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* ── 오버레이 ── */
.details-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 1100;
  display: flex;
  justify-content: flex-end;
}

/* ── 패널 ── */
.details-panel {
  width: 720px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

/* 슬라이드 애니메이션 */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 0.25s ease;
}

.slide-panel-enter-active .details-panel,
.slide-panel-leave-active .details-panel {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  opacity: 0;
}

.slide-panel-enter-from .details-panel,
.slide-panel-leave-to .details-panel {
  transform: translateX(100%);
}

/* ── 헤더 ── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-ptype {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.close-btn {
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  color: #475569;
  font-size: 15px;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 탭 바 ── */
.tab-bar {
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  overflow-x: auto;
}

.tab-btn {
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn.active {
  color: #0f172a;
  font-weight: 600;
  border-bottom-color: #0f172a;
}

.tab-btn:hover:not(.active) {
  color: #334155;
}

/* ── 패널 본문 ── */
.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.field.full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.field-value {
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
}

.field-value.desc {
  white-space: pre-wrap;
  line-height: 1.6;
}

.empty-msg {
  font-size: 13px;
  color: #94a3b8;
  padding: 20px 0;
  text-align: center;
}

/* ── 기술 목록 ── */
.tech-list {
  margin: 0;
  padding: 0 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tech-list li {
  font-size: 12px;
  color: #334155;
}

/* ── 이력 테이블 ── */
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.history-table th,
.history-table td {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  text-align: left;
  color: #334155;
}

.history-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
}
</style>
