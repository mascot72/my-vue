<!--
  ItemHoverLayerPopup.vue (target)

  출처: workspaceNew/ItemHoverLayerPopup.vue + origin/ItemInfoPopup.vue

  변경 내용:
  - origin 의 풍부한 팝업 UI 구조(헤더 태그, 그룹 경로, 상세 필드, 액션 버튼, 잠금 메시지)를 이식
  - dxplm-* 컴포넌트 의존성 제거 → 표준 HTML/Vue 로 대체
  - workspaceNew 의 hover/pinned/close 동작 유지
  - Teleport(body)로 z-index 충돌 방지
-->
<script setup lang="ts">
import { computed } from 'vue'

/** 팝업에 표시할 아이템 데이터 타입 */
interface PopupItem {
  id?: string | number
  title?: string
  titleEn?: string
  organizationNm?: string
  /** 상태 코드 (TES.ROAD_STATUS) */
  itemStatusCode?: string
  itemStatusName?: string
  /** 유효성 상태 코드 */
  validityStatus?: string
  validityStatusNm?: string
  /** 작성 상태 코드: code001=잠금, code002=작성완료 */
  writingStatus?: string
  writingStatusNm?: string
  /** 과제계획 상태 */
  projectPlanningStatus?: string
  projectPlanningStatusNm?: string
  /** 과제실행 상태 */
  projectExecutionStatus?: string
  projectExecutionStatusNm?: string
  /** 신사업 유형 */
  newBusinessType?: string
  newBusinessTypeNm?: string
  /** 로드맵 유형 */
  ptrmType?: string
  /** 기술분류 Lv3 명칭 */
  technologyClassLv1Name?: string
  technologyClassLv2Name?: string
  technologyClassLv3Name?: string
  /** OEM */
  customerCode?: string
  /** 차종 */
  carModel?: string
  /** 양산계획월 */
  sopPlanMonth?: string
  /** 개발착수 계획월 */
  start?: string | Date
  /** 개발완료 계획월 */
  end?: string | Date
  /** 최종 변경일 */
  updateDate?: string
  /** 최종 변경 승인일 */
  lastApprovalDate?: string | null
  /** 그룹 경로 (계층 구조) */
  groupPath?: string[]
  [key: string]: unknown
}

const props = defineProps<{
  show: boolean
  pinned: boolean
  top: number
  left: number
  itemData: PopupItem | null
  /** 상태 표시 필터 옵션 */
  viewStatus?: {
    statusPlan?: boolean
    statusExec?: boolean
    statusNBiz?: boolean
  }
}>()

const emit = defineEmits<{
  close: []
  openDetail: [item: PopupItem]
  enter: []
  leave: []
}>()

/** 그룹 경로 문자열 계산 */
const levelPath = computed(() => {
  const item = props.itemData
  if (!item) return ''
  if (item.ptrmType === 'PRM') {
    return item.groupPath?.slice(1).join(' > ') ?? ''
  }
  if (item.ptrmType === 'TRM') {
    return item.groupPath?.join(' > ') ?? ''
  }
  return [item.technologyClassLv1Name, item.technologyClassLv2Name, item.technologyClassLv3Name]
    .filter(Boolean)
    .join(' > ')
})

/** 날짜 포맷 (YYYY-MM-DD 형태로 표시) */
const formatDate = (val: string | Date | null | undefined): string => {
  if (!val) return '-'
  const d = val instanceof Date ? val : new Date(String(val))
  if (isNaN(d.getTime())) return String(val)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const onOpenDetail = () => {
  if (!props.itemData) return
  emit('openDetail', props.itemData)
}

const onSearchProgress = () => {
  // 진척현황조회 — MVP 범위 외
  alert('진척현황조회는 준비 중입니다.')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && itemData"
      class="item-hover-popup"
      :style="{ top: `${top}px`, left: `${left}px` }"
      @mouseenter="emit('enter')"
      @mouseleave="emit('leave')"
    >
      <!-- 팝업 헤더 -->
      <div class="popup-header">
        <!-- 잠금/유효성/과제 상태 태그 영역 (origin/ItemInfoPopup.vue 구조 동일) -->
        <div
          :class="[
            'popup-tags',
            {
              lock: itemData.writingStatus === 'code001',
              unlock: itemData.writingStatus === 'code002',
            },
          ]"
        >
          <span class="popup-org">{{ itemData.organizationNm }}</span>

          <!-- validityStatus 가 code003(정상)이 아닐 때: 유효성 상태만 -->
          <template v-if="itemData.validityStatus !== 'code003'">
            <span class="popup-status">{{ itemData.validityStatusNm || itemData.validityStatus }}</span>
          </template>

          <!-- validityStatus === code003: 상세 상태 표시 -->
          <template v-else>
            <span v-if="itemData.writingStatus === 'code001'" class="popup-status lock-status">
              {{ itemData.writingStatusNm || itemData.writingStatus }}
            </span>
            <span
              v-if="viewStatus?.statusPlan && itemData.projectPlanningStatus"
              class="popup-status plan-status"
            >
              {{ itemData.projectPlanningStatusNm || itemData.projectPlanningStatus }}
            </span>
            <span
              v-if="viewStatus?.statusExec && itemData.projectExecutionStatus"
              class="popup-status exec-status"
            >
              {{ itemData.projectExecutionStatusNm || itemData.projectExecutionStatus }}
            </span>
            <span
              v-if="viewStatus?.statusNBiz && itemData.newBusinessType"
              class="popup-status nbiz-status"
            >
              {{ itemData.newBusinessTypeNm || itemData.newBusinessType }}
            </span>
          </template>
        </div>

        <div class="popup-title-row">
          <strong class="popup-title">{{ itemData.title || '-' }}</strong>
          <div class="popup-actions">
            <span v-if="pinned" class="pin-badge">고정</span>
            <button type="button" class="close-btn" @click="emit('close')">✕</button>
          </div>
        </div>
      </div>

      <!-- 그룹 경로 -->
      <div v-if="levelPath" class="popup-group-path">{{ levelPath }}</div>

      <!-- 팝업 본문 -->
      <div class="popup-body">
        <!-- PRM 전용 필드 -->
        <template v-if="itemData.ptrmType === 'PRM'">
          <div class="row">
            <span class="label">OEM</span>
            <span class="value">{{ itemData.customerCode || '-' }}</span>
          </div>
          <div class="row">
            <span class="label">차종</span>
            <span class="value">{{ itemData.carModel || '-' }}</span>
          </div>
          <div class="row">
            <span class="label">양산계획일</span>
            <span class="value">{{ formatDate(itemData.sopPlanMonth) }}</span>
          </div>
        </template>

        <!-- TRM / CMM / COM 전용 필드 -->
        <template v-else>
          <div class="row">
            <span class="label">개발착수 계획월</span>
            <span class="value">{{ formatDate(itemData.start) }}</span>
          </div>
          <div class="row">
            <span class="label">개발종료 계획월</span>
            <span class="value">{{ formatDate(itemData.end) }}</span>
          </div>
        </template>

        <!-- 공통 필드 -->
        <div class="row">
          <span class="label">최종 변경일</span>
          <span class="value">{{ formatDate(itemData.updateDate) }}</span>
        </div>
        <div class="row">
          <span class="label">최종 변경 승인일</span>
          <span class="value">{{ formatDate(itemData.lastApprovalDate) }}</span>
        </div>

        <!-- 설명 -->
        <div v-if="itemData.titleEn" class="row desc">
          <span class="label">설명</span>
          <span class="value">{{ itemData.titleEn }}</span>
        </div>
      </div>

      <!-- 액션 버튼 (origin/ItemInfoPopup.vue 참조) -->
      <div class="popup-actions-bar">
        <button type="button" class="action-btn" @click="onSearchProgress">진척현황조회</button>
        <button type="button" class="action-btn primary" @click="onOpenDetail">상세조회</button>
      </div>

      <!-- 잠금 메시지 (code001=잠금 중) -->
      <div v-if="itemData.writingStatus === 'code001'" class="popup-lock-msg">
        🔒 현재 편집 중입니다. 동시 수정이 불가능합니다.
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.item-hover-popup {
  position: fixed;
  z-index: 1000;
  width: 340px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  font-size: 12px;
  color: #1e293b;
}

/* ── 헤더 ── */
.popup-header {
  padding: 10px 12px 8px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.popup-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.popup-org {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.popup-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
}

.lock-status  { background: #fee2e2; color: #b91c1c; }
.plan-status  { background: #dbeafe; color: #1e40af; }
.exec-status  { background: #dcfce7; color: #166534; }
.nbiz-status  { background: #fef9c3; color: #a16207; }

/* lock/unlock 아이콘 (태그 왼쪽) */
.popup-tags.lock::before  { content: '🔒'; font-size: 11px; }
.popup-tags.unlock::before{ content: '✏️'; font-size: 11px; }

.popup-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.popup-title {
  font-size: 13px;
  color: #0f172a;
  line-height: 1.35;
  flex: 1;
}

.popup-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.pin-badge {
  font-size: 10px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
  border-radius: 999px;
  padding: 2px 6px;
}

.close-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  font-size: 14px;
  line-height: 1;
}

/* ── 그룹 경로 ── */
.popup-group-path {
  padding: 5px 12px;
  font-size: 11px;
  color: #64748b;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 본문 ── */
.popup-body {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  gap: 8px;
}

.label {
  min-width: 80px;
  color: #64748b;
  flex-shrink: 0;
}

.value {
  color: #334155;
  word-break: break-word;
}

.desc .value {
  line-height: 1.4;
}

/* ── 액션 버튼 ── */
.popup-actions-bar {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}

.action-btn {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 11px;
  color: #334155;
}

.action-btn.primary {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

/* ── 잠금 메시지 ── */
.popup-lock-msg {
  padding: 8px 12px;
  background: #fff7ed;
  color: #92400e;
  font-size: 11px;
  border-top: 1px solid #fed7aa;
  border-radius: 0 0 12px 12px;
}
</style>
