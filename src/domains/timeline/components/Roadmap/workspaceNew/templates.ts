/**
 * @file templates.ts
 * @description vis-timeline 의 itemTemplate / groupTemplate 렌더링 함수 모음.
 *
 * vis-timeline은 각 아이템/그룹 행을 렌더링할 때 이 함수들을 호출합니다.
 * 반환값은 innerHTML 문자열 또는 DOM 엘리먼트입니다.
 *
 * ⚠️ 인라인 style 제거 원칙:
 *   timeline.css 의 전용 클래스(.vis-group-inner, .vis-group-label 등)를 사용합니다.
 *   인라인 style은 CSS 우선순위 충돌, 다크모드 지원 불가, 재사용 불가 등의 문제가 있습니다.
 *   새 스타일이 필요하면 styles/timeline.css 를 먼저 확인하세요.
 *
 * @see styles/timeline.css - 실제 스타일 정의 위치
 */

/** 파일 권한 위임 클래스 경로 (썸네일 URL 구성에 사용) */
const DELEGATE_CLASS = 'com.mando.dxplm.tes.roadmap.file.delegate.RoadmapFileAuthDelegate'

/** vis-timeline 에 전달되는 일반 데이터 레코드 타입 */
type TemplateRecord = Record<string, unknown>

/**
 * 개별 로드맵 아이템의 HTML 템플릿을 생성합니다.
 *
 * 구성 요소:
 * - `.vis-item-head`: 잠금/해제 아이콘 + 조직명 + 상태 태그
 * - `.vis-item-body`
 *   - `.vis-item-text`: 제목 (PRM: 제품명, TRM: 기술분류 > 기술명)
 *   - `.vis-item-imgwrap` (PRM 전용): 썸네일 + 펼침(+/-) 버튼
 *
 * activeArrowItemIds 에 포함된 아이템은 '+' 버튼이 '-' 로 전환되어
 * 하위기술 트리가 열려있는 상태임을 시각적으로 표시합니다.
 *
 * @param data - vis-timeline이 전달하는 아이템 데이터
 * @param timelineState - 현재 활성화된 화살표 연결 상태 (activeArrowItemIds)
 * @returns HTML 문자열
 */
export const itemTemplate = (
  data: TemplateRecord,
  timelineState: { activeArrowItemIds: string[] },
) => {
  /** 작성 상태에 따른 아이콘 클래스 (lock/unlock) */
  const writingClass =
    data.writingStatus === 'code001' ? 'lock' : data.writingStatus === 'code002' ? 'unlock' : ''

  /** 현재 하위기술 트리가 활성화된 아이템 여부 */
  const isActive = timelineState.activeArrowItemIds.includes(String(data.id))

  /**
   * 아이템 타입별 제목 HTML:
   * - PRM: 제품명만 표시
   * - TRM/COM: '기술분류Lv3 > 기술명' 형태로 표시
   */
  const titleHtml =
    data.ptrmType === 'PRM'
      ? `<div class="vis-item-title">${data.title || ''}</div>`
      : `<div class="vis-item-title">${data.technologyClassLv3Name || 'N/A'} > ${data.title || ''}</div>`

  /**
   * PRM 전용 이미지 + 펼침 버튼 영역.
   * - 썸네일: FMS API 에서 동적으로 로드 (loading="lazy" 로 지연 로드)
   * - hasTrm이 true인 경우에만 펼침 버튼 노출
   * - data-action="add-item" 으로 이벤트 위임 처리 (onContainerClick 참조)
   */
  let imageWrapHtml = ''
  if (data.ptrmType === 'PRM') {
    const imgSrc = `https://dev-dxplm-ext.hlmando.com/fms/rest/v1/file/thumbnail?ownerId=${data.id}&sectionType=-&ownerDelegateClass=${DELEGATE_CLASS}&createDate=${data.updateDate}`
    const addButtonHtml = data.hasTrm
      ? `<div class="vis-item-add ${isActive ? 'active' : ''}" data-action="add-item" data-id="${data.id}">${isActive ? '-' : '+'}</div>`
      : ''

    imageWrapHtml = `
      <div class="vis-item-imgwrap">
        <img class="vis-item-img" src="${imgSrc}" loading="lazy" />
        ${addButtonHtml}
      </div>`
  }

  return `
    <div class="vis-item-contents" data-id="${data.id}">
      <div class="vis-item-head">
        <div class="vis-item-tags ${writingClass}">
          <span class="vis-item-name">${data.organizationNm || ''}</span>
          <span class="vis-item-status">${data.itemStatusName || ''}</span>
        </div>
      </div>
      <div class="vis-item-body">
        <div class="vis-item-text">
          ${titleHtml}
          <div class="vis-item-tech">${data.titleEn || ''}</div>
        </div>
        ${imageWrapHtml}
      </div>
    </div>
  `
}

/**
 * 그룹(행) 헤더의 HTML 템플릿을 생성합니다.
 *
 * 그룹 유형:
 * - 조직 그룹 (isOrganization=true): 체크박스 없음, 오른쪽에 히스토리 토글 스위치 표시
 * - 제품 그룹 루트 (isSubGroup이 false이거나 부모가 ORG-로 시작): 체크박스 표시
 * - 하위 그룹 (중첩 nestedGroup): 체크박스 없음
 *
 * 클릭 이벤트는 onContainerClick() 에서 이벤트 위임으로 처리합니다.
 * - `.vis-group-check` 의 change → toggleGroupVisibility()
 * - `.custom-switch` 의 click → 히스토리 기능 (data-action="history-switch")
 *
 * ✅ 인라인 style 제거:
 *   기존의 `style="display:flex; ..."` 를 timeline.css 의 클래스로 대체했습니다.
 *   (.vis-group-inner, .vis-group-label → timeline.css 참조)
 *
 * @param group - vis-timeline이 전달하는 그룹 데이터
 * @param isChecked - 체크박스의 현재 체크 상태
 * @param msg - 조직 그룹에 표시할 추가 메시지 (히스토리 토글 레이블)
 * @returns HTML 문자열
 */
export const groupTemplate = (group: TemplateRecord, isChecked: boolean, msg: string) => {
  /**
   * 최상위 제품 그룹 여부 판별:
   * - isSubGroup 이 false이면 독립 최상위 그룹
   * - 부모 ID가 'ORG-'로 시작하면 조직 바로 아래 제품 그룹
   */
  const isRootProductGroup = !group.isSubGroup || String(group.parent || '').startsWith('ORG-')

  /** 체크박스는 조직 계층을 제외한 최상위 제품 그룹에만 표시합니다. */
  const showCheckbox = !group.isOrganization && isRootProductGroup

  /**
   * 체크박스 HTML:
   * - data-id 로 그룹 ID를 전달해 이벤트 위임에서 참조합니다.
   * - checked 속성으로 초기 상태를 설정합니다.
   */
  const checkboxHtml = showCheckbox
    ? `<input type="checkbox" class="vis-group-check" data-id="${group.id}" ${isChecked ? 'checked' : ''} />`
    : ''

  /**
   * 조직 그룹 전용 추가 컨트롤:
   * - 히스토리 토글 스위치 (data-action="history-switch" 로 이벤트 위임 처리)
   * - msg 는 부모 컴포넌트(Timeline.vue)에서 prop 으로 전달됩니다.
   *
   * @note `@click.stop` 는 Vue 디렉티브라 innerHTML 에서 동작하지 않습니다.
   *   클릭 버블링 방지는 onContainerClick() 의 이벤트 위임 로직에서 처리합니다.
   */
  let extraHtml = ''
  if (group.isOrganization) {
    extraHtml = `
      <div class="vis-group-extra">
        <label class="msg-label">${msg || ''}</label>
        <div class="custom-switch" data-action="history-switch" data-id="${group.id}">
          <input type="checkbox" id="sw-${group.id}" class="sw-input" />
          <label for="sw-${group.id}" class="sw-slider"></label>
        </div>
      </div>`
  }

  /**
   * 최종 그룹 HTML 구조:
   * - .vis-group-inner: 가로 flex 컨테이너 (timeline.css 에 스타일 정의)
   *   - .vis-group-label: 체크박스 + 그룹 이름 (timeline.css 에 스타일 정의)
   *   - .vis-group-extra: 조직 계층 전용 우측 컨트롤 (timeline.css 에 스타일 정의)
   */
  return `
    <div class="vis-group-inner">
      <div class="vis-group-label">
        ${checkboxHtml}
        <span class="group-text">${group.content}</span>
      </div>
      ${extraHtml}
    </div>
  `
}

