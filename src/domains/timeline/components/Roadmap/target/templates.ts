/**
 * @file templates.ts (target)
 * @description vis-timeline 의 itemTemplate / groupTemplate 렌더링 함수.
 *
 * origin/TimelineGroup.vue 의 HTML 디자인을 groupTemplate에 적용합니다.
 * origin/TimelineItem.vue  의 HTML 디자인을 itemTemplate에 적용합니다.
 *
 * CSS 클래스는 timeline.css 및 workspaceNew 의 CSS를 재사용합니다.
 * 이벤트는 Timeline.vue 의 onContainerClick() 이벤트 위임으로 처리합니다.
 *
 * @see origin/TimelineGroup.vue - 그룹 디자인 출처
 * @see origin/TimelineItem.vue  - 아이템 디자인 출처
 * @see styles/timeline.css      - CSS 클래스 정의
 */

/** 파일 권한 위임 클래스 (썸네일 URL 구성) */
const DELEGATE_CLASS = 'com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate'

/** vis-timeline 데이터 레코드 */
type TemplateRecord = Record<string, unknown>

// ─────────────────────────────────────────────────────────
// 아이템 상태코드 → CSS 클래스 매핑
// origin/VisTimeline.vue getItemStatusClass() 와 동일한 규칙
// ─────────────────────────────────────────────────────────
const STATUS_CLASS_MAP: Record<string, string> = {
  code003: 'status-valid-normal', // 정상
  code004: 'status-valid-hold',   // Hold
  code005: 'status-valid-drop',   // Drop
  Change: 'status-compare-change',
  Add: 'status-compare-add',
  Delete: 'status-compare-delete',
}

/**
 * 유효성 상태코드를 CSS 클래스로 변환합니다.
 * @param code - itemStatusCode / validityStatus
 */
const getStatusClass = (code: unknown): string => STATUS_CLASS_MAP[String(code ?? '')] ?? ''

// ─────────────────────────────────────────────────────────
// itemTemplate
// 출처: origin/TimelineItem.vue TIMELINE_ITEM_DESIGN_SOURCE 참조
// ─────────────────────────────────────────────────────────

/**
 * 개별 로드맵 아이템의 HTML 템플릿을 생성합니다.
 *
 * origin/TimelineItem.vue 의 디자인(HTML 구조)을 적용한 버전입니다.
 *
 * 구조:
 * ```
 * .vis-item-wrapper(.status-*)
 *   .vis-item-contents
 *     .vis-item-head
 *       .vis-item-tags(.lock|.unlock)
 *         .vis-item-name   — 조직명
 *         .vis-item-status — 상태명
 *       .vis-item-comment  — (예약)
 *     .vis-item-body
 *       .vis-item-text
 *         .vis-item-title  — 제품명 / '기술분류 > 기술명'
 *         .vis-item-tech   — 영문명
 *       .vis-item-imgwrap (PRM 전용)
 *         .vis-item-img    — 썸네일 (lazy load)
 *         .vis-item-add    — +/- 토글 버튼 (data-action="add-item")
 * ```
 *
 * @param data          - vis-timeline이 전달하는 아이템 데이터
 * @param timelineState - 현재 활성화된 화살표 연결 상태 ({activeArrowItemIds})
 * @returns HTML 문자열
 */
export const itemTemplate = (
  data: TemplateRecord,
  timelineState: { activeArrowItemIds: string[] },
): string => {
  // 작성 상태: lock(code001) / unlock(code002)
  const writingClass =
    data.writingStatus === 'code001' ? 'lock' : data.writingStatus === 'code002' ? 'unlock' : ''

  // 유효성 상태 CSS 클래스 (wrapper에 부착)
  const statusClass = getStatusClass(data.validityStatus)

  // 현재 하위기술 트리가 활성화된 아이템 여부
  const isActive = timelineState.activeArrowItemIds.includes(String(data.id))

  // 아이템 타입별 제목 HTML
  const titleHtml =
    data.ptrmType === 'PRM'
      ? `<div class="vis-item-title">${data.title ?? ''}</div>`
      : `<div class="vis-item-title">${data.technologyClassLv3Name ?? 'N/A'} &gt; ${data.title ?? ''}</div>`

  // PRM 전용 이미지 + 펼침 버튼
  let imageWrapHtml = ''
  if (data.ptrmType === 'PRM') {
    const imgSrc = `https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${data.id}&sectionType=-&ownerDelegateClass=${DELEGATE_CLASS}&createDate=${data.updateDate}`
    const addButtonHtml = data.hasTrm
      ? `<div class="vis-item-add${isActive ? ' active' : ''}" data-action="add-item" data-id="${data.id}">${isActive ? '-' : '+'}</div>`
      : ''
    imageWrapHtml = `
      <div class="vis-item-imgwrap">
        <img class="vis-item-img" src="${imgSrc}" loading="lazy" />
        ${addButtonHtml}
      </div>`
  }

  return `
    <div class="vis-item-wrapper${statusClass ? ' ' + statusClass : ''}" data-id="${data.id}">
      <div class="vis-item-contents" data-id="${data.id}">
        <div class="vis-item-head">
          <div class="vis-item-tags ${writingClass}">
            <span class="vis-item-name">${data.organizationNm ?? ''}</span>
            <span class="vis-item-status">${data.itemStatusName ?? ''}</span>
          </div>
          <div class="vis-item-comment"></div>
        </div>
        <div class="vis-item-body">
          <div class="vis-item-text">
            ${titleHtml}
            <div class="vis-item-tech">${data.titleEn ?? ''}</div>
          </div>
          ${imageWrapHtml}
        </div>
      </div>
    </div>
  `
}

// ─────────────────────────────────────────────────────────
// groupTemplate
// 출처: origin/TimelineGroup.vue TIMELINE_GROUP_DESIGN_SOURCE 참조
// ─────────────────────────────────────────────────────────

/**
 * 그룹(행) 헤더의 HTML 템플릿을 생성합니다.
 *
 * origin/TimelineGroup.vue 의 디자인을 적용한 버전입니다.
 *
 * 구조:
 * ```
 * .vis-group-wrapper
 *   .vis-group-label (label — checkbox + 그룹명)
 *   .group-history-wrap (조직 그룹 전용)
 *     label — 메시지
 *     .group-history-switch (checkbox)
 * ```
 *
 * 클릭 이벤트는 Timeline.vue 의 onContainerClick() 이벤트 위임으로 처리합니다.
 * - .group-toggle-input → toggleGroupVisibility()
 * - .group-history-switch → historySwitch (data-action="history-switch")
 *
 * @param group     - vis-timeline이 전달하는 그룹 데이터
 * @param isChecked - 체크박스의 현재 체크 상태
 * @param msg       - 조직 그룹 우측 메시지 (히스토리 토글 레이블)
 * @returns HTML 문자열
 */
export const groupTemplate = (group: TemplateRecord, isChecked: boolean, msg: string): string => {
  // 최상위 제품 그룹(조직 아래 바로 연결된 그룹)만 체크박스 노출
  const isRootProductGroup = !group.isSubGroup || String(group.parent ?? '').startsWith('ORG-')
  const showCheckbox = !group.isOrganization && isRootProductGroup

  // 체크박스 HTML — data-id로 이벤트 위임에서 참조
  const checkboxHtml = showCheckbox
    ? `<input class="group-toggle-input vis-group-check mr-1" type="checkbox" data-id="${group.id}" ${isChecked ? 'checked' : ''} />`
    : ''

  // 조직 그룹 전용 히스토리 toggle
  // @note @click.stop 는 innerHTML에서 미동작 → data-action="history-switch" 이벤트 위임으로 대체
  const historyWrapHtml = group.isOrganization
    ? `<div class="group-history-wrap" data-action="history-switch" data-id="${group.id}">
        <label class="mr-8 font-size-12">${msg ?? ''}</label>
        <input class="group-history-switch" type="checkbox" id="hsw-${group.id}" />
      </div>`
    : ''

  return `
    <div class="vis-group-wrapper">
      <label class="vis-group-label">
        ${checkboxHtml}
        <span class="group-content">${group.content ?? ''}</span>
      </label>
      ${historyWrapHtml}
    </div>
  `
}
