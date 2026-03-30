/**
 * @file timeline.store.ts
 * @description workspaceNew 전용 Pinia 스토어.
 *
 * ⚠️ vis-data DataSet과 Vue Proxy 충돌 방지 설계:
 * - vis-data의 DataSet은 자체적인 내부 변경 추적(change tracking) 시스템을 사용합니다.
 * - Pinia의 `state()`에서 반환된 객체는 Vue의 `reactive()`로 래핑되어 Proxy가 됩니다.
 * - Proxy가 된 DataSet은 vis-data 내부의 `instanceof` 검사 실패, 이벤트 누락,
 *   double-tracking으로 인한 성능 저하 등의 문제를 일으킵니다.
 * - 해결책: `markRaw(new DataSet([]))` 로 Vue 반응형 추적 대상에서 제외합니다.
 *   DataSet 자체의 변경은 vis-timeline이 감지하므로, Vue 반응형이 필요 없습니다.
 */
import { defineStore } from 'pinia'
import { DataSet } from 'vis-data'
import { markRaw, reactive } from 'vue'
import { useTimelineApi } from './useTimelineApi'

/** 로드맵 유형. PRM=제품 로드맵, TRM=기술 로드맵, COM=공통 */
type RoadmapType = 'PRM' | 'TRM' | 'COM'

/**
 * 날짜 문자열을 Date 객체로 변환합니다.
 * @param value - 'YYYY-MM' 또는 ISO 형식의 날짜 문자열
 * @param endOfMonth - true일 때 해당 월의 마지막 날로 설정 (end 날짜에 사용)
 * @returns 유효하지 않은 값이면 null
 */
const convertDate = (value: string, endOfMonth = false) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (!endOfMonth) return date

  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * 언어 코드에 맞는 이름 필드를 반환합니다.
 * 우선순위: name{LangCode} → nameKo → nameEn → 빈 문자열
 * @param item - 데이터 레코드
 * @param langCode - 'Ko' | 'En' 등 접미사
 */
const nameByLang = (item: Record<string, unknown>, langCode = 'Ko') => {
  const key = `name${langCode}`
  return String(item[key] ?? item.nameKo ?? item.nameEn ?? '')
}

/** 공통 코드(DD Code) 항목 타입. 코드값과 한글/영문 명칭을 포함합니다. */
type DdCodeEntry = {
  code?: string
  codeNameKo?: string
  [key: string]: unknown
}

/**
 * vis-timeline 그룹 노드 타입.
 * - isOrganization: 조직 계층(최상위 그룹)
 * - isSubGroup: 부모 그룹이 있는 하위 그룹
 * - nestedGroups: vis-timeline의 중첩 그룹 ID 목록 (트리 구조 렌더링에 사용)
 * - treeLevel: 0=조직, 1=제품그룹
 */
type GroupNode = {
  id: string
  content: string
  parent?: string
  nestedGroups: string[]
  isOrganization: boolean
  isSubGroup: boolean
  hasChildren: boolean
  treeLevel: number
  order: number
}

/**
 * 제품 그룹 ID에서 조직 그룹 ID를 추출합니다.
 * 예: '10-205' → 'ORG-10'
 * 서버 전용 org/group endpoint 가 없는 환경에서 items 데이터를 활용해 조직을 도출합니다.
 */
const getOrgGroupId = (groupId: string) => {
  const [orgSegment] = String(groupId).split('-')
  return orgSegment ? `ORG-${orgSegment}` : ''
}

/**
 * 이미 로드된 items 배열에서 조직(orgGroups)과 전체 그룹(fullGroups)을 도출합니다.
 *
 * 배경: 서버에 org/groups 전용 엔드포인트가 없어, items의 roadOrgGroupProdLinkId 필드를
 * 파싱하여 그룹 트리를 메모리에서 생성합니다.
 * - 장점: items가 이미 로드된 경우 추가 API 호출 없이 그룹을 재구성합니다 (N+1 방지).
 * - 조직 ID 형식: 'ORG-{숫자}' (예: 'ORG-10')
 * - 제품 그룹 ID 형식: '{조직번호}-{제품번호}' (예: '10-205')
 *
 * @param items - 스토어의 items 배열 (vis-data DataSet이 아닌 Vue 반응형 배열)
 * @returns { orgGroups, fullGroups } — 각각 조직 행과 전체 행(조직+제품 그룹) 배열
 */
const buildGroupsFromItems = (items: Array<Record<string, unknown>>) => {
  const orgMap = new Map<string, GroupNode>()
  const productMap = new Map<string, GroupNode>()

  items.forEach((item) => {
    const groupId = String(item.group ?? item.roadOrgGroupProdLinkId ?? '')
    if (!groupId) return

    const orgId = getOrgGroupId(groupId)
    if (orgId && !orgMap.has(orgId)) {
      orgMap.set(orgId, {
        id: orgId,
        content: `조직 ${orgId.replace('ORG-', '')}`,
        parent: undefined,
        nestedGroups: [],
        isOrganization: true,
        isSubGroup: false,
        hasChildren: true,
        treeLevel: 0,
        order: Number(orgId.replace('ORG-', '')) || orgMap.size + 1,
      })
    }

    if (!productMap.has(groupId)) {
      productMap.set(groupId, {
        id: groupId,
        content: groupId,
        parent: orgId || undefined,
        nestedGroups: [],
        isOrganization: false,
        isSubGroup: !!orgId,
        hasChildren: false,
        treeLevel: orgId ? 1 : 0,
        order: Number(item.order ?? 0),
      })
    }
  })

  productMap.forEach((group) => {
    if (!group.parent) return
    const parent = orgMap.get(group.parent)
    if (parent && !parent.nestedGroups.includes(group.id)) {
      parent.nestedGroups.push(group.id)
    }
  })

  const orgGroups = Array.from(orgMap.values())
  const productGroups = Array.from(productMap.values())
  const fullGroups = [...orgGroups, ...productGroups]

  return { orgGroups, fullGroups }
}

/**
 * 공통 코드 캐시 맵 (스토어 외부 모듈 스코프에 선언).
 * 여러 action에서 공유하며, masterCode → DdCodeEntry[] 형태로 저장합니다.
 * reactive()로 선언되어 있지만 코드 조회용으로만 사용하므로 반응형 의존이 없습니다.
 * ⚠️ Vue Proxy가 Map 위에 씌워지지만, 코드 조회는 단순 get/set이므로 충돌 없음.
 */
const commCodeMap = reactive(new Map<string, DdCodeEntry[]>())

/** 기본 언어 코드. nameByLang()에서 사용합니다. */
const langCode = 'Ko'

export const useWorkspaceNewTimelineStore = defineStore('roadmap:workspace-new:timeline', {
  state: () => ({
    /**
     * groups / items: Vue 반응형 배열. UI(v-for 등)에서 사용하거나
     * 캐싱 목적으로 보관합니다. DataSet 과 sync 됩니다.
     */
    groups: [] as Array<Record<string, unknown>>,
    items: [] as Array<Record<string, unknown>>,

    /**
     * groupsDS / itemsDS: vis-data DataSet 인스턴스.
     * ❗ markRaw() 필수 — Vue Proxy 래핑 방지.
     *   - Pinia의 state()는 내부적으로 reactive()로 래핑됩니다.
     *   - DataSet은 자체 변경 추적 메커니즘이 있어 Proxy와 충돌합니다.
     *   - markRaw로 선언하면 Vue는 이 객체를 반응형으로 만들지 않습니다.
     *   - Timeline이 직접 구독하므로 Vue 반응형 없이도 화면이 업데이트됩니다.
     */
    groupsDS: markRaw(new DataSet([])),
    itemsDS: markRaw(new DataSet([])),
    orgGroups: [] as Array<Record<string, unknown>>,
    useSubTechCache: true,
    subTechCacheByParentId: {} as Record<string, Array<Record<string, unknown>>>,
    groupItemCacheByGroupId: {} as Record<string, Array<Record<string, unknown>>>,
    loading: false,
    error: '' as string,
    roadmapType: 'PRM' as RoadmapType,
  }),

  getters: {
    /**
     * API 함수 모음을 반환합니다.
     * getter로 선언해 action 내에서 `this.api.fetchItems()` 형태로 접근합니다.
     * Composition API 방식(useTimelineApi)과 Options API 방식(store)을 연결하는 브릿지입니다.
     */
    api: () => useTimelineApi(),

    /**
     * PRM 타입(최상위 제품 로드맵)의 아이템만 필터링합니다.
     * TRM/COM 하위 기술 아이템은 제외됩니다.
     */
    rootItems: (state) => state.items.filter((item) => item.ptrmType === 'PRM'),
  },

  actions: {
    // ===================================================
    // ① 공통 코드(DD Code) 관리
    // ===================================================

    /**
     * 서버에서 공통 코드 목록을 불러와 캐시(commCodeMap)에 저장합니다.
     * 반복 호출 시에도 Map이 덮어쓰여지므로 최신 데이터를 유지합니다.
     *
     * @param masterCode - 조회할 마스터 코드 (예: 'TES.ROAD_STATUS')
     */
    async syncDdCode(masterCode: string) {
      try {
        const data = await this.api.fetchDdCode?.(masterCode)
        if (data && Array.isArray(data)) {
          commCodeMap.set(masterCode, data)
        }
      } catch (error) {
        console.error('syncDdCode error:', error)
      }
    },

    /**
     * 캐시된 공통 코드에서 코드값에 해당하는 한글 명칭을 반환합니다.
     * 캐시 미스 시 원본 code 값을 그대로 반환합니다(graceful degradation).
     *
     * @param masterCode - 마스터 코드 (예: 'TES.ROAD_STATUS')
     * @param code - 개별 코드값 (예: 'ACTIVE')
     * @returns 한글 명칭 또는 원본 code
     */
    getDdName(masterCode: string, code: string): string {
      const codes = commCodeMap.get(masterCode)
      if (!codes) return code
      const found = codes.find((c) => c.code === code)
      return found ? found[`codeName${langCode}`] ?? found.codeNameKo ?? code : code
    },

    // ===================================================
    // ② 그룹(조직/제품) 로드
    // ===================================================

    /**
     * 조직(최상위) 그룹 목록을 로드합니다.
     *
     * 최적화 단계:
     * 1. items가 이미 로드된 경우 → buildGroupsFromItems()로 메모리에서 도출 (API 호출 없음)
     * 2. items가 없으면 → fetchOrgGroups() API 호출
     *
     * 이 함수는 loadGroups()에서 내부적으로도 호출되므로,
     * 단독으로 호출할 일은 드뭅니다.
     *
     * @param payload.roadmapType - 로드맵 유형 (기본값: 현재 store 값)
     */
    async loadOrgGroups(payload: { roadmapType?: RoadmapType } = {}) {
      this.loading = true
      try {
        if (this.items.length > 0) {
          const { orgGroups } = buildGroupsFromItems(this.items)
          this.orgGroups = orgGroups
          return
        }

        const data = await this.api.fetchOrgGroups?.(payload)
        if (Array.isArray(data)) {
          this.orgGroups = data.map((org: Record<string, unknown>) => ({
            id: String(org.id),
            content: nameByLang(org),
            parent: undefined,
            nestedGroups: [],
            isOrganization: true,
            isSubGroup: false,
            hasChildren: (data as Array<Record<string, unknown>>).some(
              (g) => String(g.parent) === String(org.id),
            ),
            treeLevel: 0,
            order: Number(org.seqOrder ?? 0),
          }))
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'OrgGroups를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },

    /**
     * 전체 그룹(조직 + 제품그룹) 트리를 로드하고 DataSet에 반영합니다.
     *
     * 최적화: items가 이미 로드된 경우 API를 추가로 호출하지 않고
     * buildGroupsFromItems()로 트리를 재구성합니다.
     * → loadGroups() 단독 호출 시 API 1회, items 로드 이후 호출 시 0회 추가 호출.
     *
     * vis-timeline은 group.nestedGroups 배열로 부모-자식 트리를 렌더링합니다.
     * 이 함수는 그 관계를 buildGroupsFromItems 또는 서버 데이터로 설정합니다.
     *
     * ⚠️ groupsDS.add()에 전달되는 데이터는 Vue Proxy가 없는 순수 객체여야 합니다.
     * (DataSet은 markRaw되어 있으므로 spread된 plain object는 안전합니다.)
     *
     * @param payload.roadmapType - 로드맵 유형
     * @param payload.langCode - 그룹 명칭 언어 ('Ko' | 'En')
     */
    async loadGroups(payload: { roadmapType?: RoadmapType; langCode?: string } = {}) {
      this.loading = true
      this.error = ''
      try {
        if (this.items.length > 0) {
          const { orgGroups, fullGroups } = buildGroupsFromItems(this.items)
          this.orgGroups = orgGroups
          this.groups = fullGroups
          this.groupsDS.clear()
          this.groupsDS.add(this.groups as never[])
          return
        }

        await this.loadOrgGroups(payload)
        const data = await this.api.fetchGroups?.(payload)
        if (!Array.isArray(data)) throw new Error('Invalid groups data')

        const fullGroups: GroupNode[] = [
          ...(this.orgGroups as GroupNode[]),
          ...data.map((group: Record<string, unknown>): GroupNode => ({
            id: String(group.id),
            content: nameByLang(group),
            parent: group.parent ? String(group.parent) : undefined,
            nestedGroups: [],
            isOrganization: false,
            isSubGroup: !!group.parent,
            hasChildren: false,
            treeLevel: group.parent ? 1 : 0,
            order: Number(group.seqIndex ?? 0),
          })),
        ]

        // 트리 구조 빌드: 부모-자식 관계 설정
        const groupMap = new Map(fullGroups.map((g) => [String(g.id), g]))
        fullGroups.forEach((group) => {
          if (group.parent && groupMap.has(String(group.parent))) {
            const parent = groupMap.get(String(group.parent))
            if (parent && !parent.nestedGroups.includes(String(group.id))) {
              parent.nestedGroups.push(String(group.id))
            }
          }
        })

        this.groups = fullGroups
        this.groupsDS.clear()
        this.groupsDS.add(this.groups as never[])
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Groups를 불러오지 못했습니다.'
        console.error('loadGroups error', error)
      } finally {
        this.loading = false
      }
    },

    // ===================================================
    // ③ 하위기술(TRM/COM) 캐싱 관리
    // ===================================================

    /**
     * 하위기술 지연로딩(lazy-load) 캐시 기능을 켜거나 끕니다.
     * 비활성화 시 기존 캐시를 전부 삭제합니다.
     *
     * 캐싱을 활성화하면 같은 parentId의 TRM 데이터를 서버에서 재요청하지 않습니다.
     * 메모리를 희생하여 응답 속도를 높이는 trade-off 옵션입니다.
     *
     * @param enabled - true: 캐시 사용, false: 캐시 사용 안 함
     */
    setSubTechCacheEnabled(enabled: boolean) {
      this.useSubTechCache = enabled
      if (!enabled) {
        this.subTechCacheByParentId = {}
      }
    },

    /**
     * 특정 부모 아이템의 하위기술 캐시를 반환합니다.
     * 캐시 없으면 빈 배열을 반환합니다.
     * ⚠️ 복사본(shallow copy)을 반환하여 원본 캐시 오염을 방지합니다.
     *
     * @param parentId - 부모(PRM) 아이템의 ID
     */
    getCachedSubTechItems(parentId: string) {
      const cached = this.subTechCacheByParentId[parentId]
      if (!cached) return []
      return cached.map((item) => ({ ...item }))
    },

    /**
     * 하위기술 아이템을 캐시에 저장합니다.
     * ⚠️ 원본 배열 참조를 저장하지 않고 shallow copy합니다.
     * 이후 DataSet에서 변경이 발생해도 캐시가 영향받지 않습니다.
     *
     * @param parentId - 부모(PRM) 아이템의 ID
     * @param items - 저장할 하위기술 아이템 배열
     */
    cacheSubTechItems(parentId: string, items: Array<Record<string, unknown>>) {
      this.subTechCacheByParentId[parentId] = items.map((item) => ({ ...item }))
    },

    /**
     * 하위기술 캐시를 삭제합니다.
     * - parentId 지정 시: 해당 부모의 캐시만 삭제
     * - parentId 생략 시: 전체 캐시 초기화
     *
     * @param parentId - 특정 부모 ID (생략하면 전체 삭제)
     */
    clearSubTechCache(parentId?: string) {
      if (!parentId) {
        this.subTechCacheByParentId = {}
        return
      }
      delete this.subTechCacheByParentId[parentId]
    },

    // ===================================================
    // ④ 그룹별 아이템 캐싱
    // ===================================================

    /**
     * 특정 그룹 ID에 속한 아이템 캐시를 반환합니다.
     * 캐시 미스 시 빈 배열 반환. getCachedSubTechItems와 같은 방식으로 동작합니다.
     *
     * @param groupId - timeline 그룹의 ID
     */
    getCachedGroupItems(groupId: string) {
      const cached = this.groupItemCacheByGroupId[groupId]
      if (!cached) return []
      return cached.map((item) => ({ ...item }))
    },

    /**
     * 그룹별 아이템을 캐시에 저장합니다. shallow copy 저장.
     *
     * @param groupId - timeline 그룹의 ID
     * @param items - 저장할 아이템 배열
     */
    cacheGroupItems(groupId: string, items: Array<Record<string, unknown>>) {
      this.groupItemCacheByGroupId[groupId] = items.map((item) => ({ ...item }))
    },

    /**
     * 그룹 아이템 캐시를 삭제합니다.
     * - groupId 지정: 해당 그룹만 삭제
     * - groupId 생략: 전체 초기화
     *
     * @param groupId - 특정 그룹 ID (생략하면 전체 삭제)
     */
    clearGroupItemCache(groupId?: string) {
      if (!groupId) {
        this.groupItemCacheByGroupId = {}
        return
      }
      delete this.groupItemCacheByGroupId[groupId]
    },



    // ===================================================
    // ⑤ DataSet 직접 조작 (그룹 / 아이템)
    // ===================================================

    /**
     * 전달된 그룹 배열로 state.groups와 groupsDS를 동기화합니다.
     * clear() 후 add()로 전체 교체합니다.
     *
     * ⚠️ vis-data DataSet.add()는 Vue Proxy가 없는 순수 객체를 기대합니다.
     * groups 배열의 각 요소가 Proxy라면 DataSet 내부에서 예상치 못한 문제가 생길 수 있습니다.
     * 호출 전 toRaw()로 proxy를 제거하거나, plain object 형태로 전달하세요.
     *
     * @param groups - 설정할 그룹 배열
     */
    setGroups(groups: Array<Record<string, unknown>>) {
      this.groups = groups
      this.groupsDS.clear()
      this.groupsDS.add(groups as never[])
    },


    /**
     * 제품 로드맵 아이템(PRM)을 서버에서 불러와 DataSet에 반영합니다.
     *
     * 흐름:
     * 1. fetchItems() API 호출 → 원시 서버 데이터 수신
     * 2. 각 필드를 vis-timeline 호환 형식으로 매핑 (start/end: Date, id: string 등)
     * 3. items 배열과 itemsDS에 동시 저장
     * 4. items에서 파생된 flat 그룹을 derivedGroups로 생성해 setGroups() 적용
     *    (별도 loadGroups() 호출 전 임시 그룹 역할)
     *
     * ✅ 성능:
     * - 서버 응답(res)은 순수 JSON이므로 Vue Proxy가 없습니다.
     * - mapped 배열도 spread로 생성된 plain object라 DataSet에 안전하게 전달됩니다.
     *
     * @param payload.roadmapType - 로드맵 유형 (기본: 현재 store 값)
     * @param payload.includeInactive - 비활성 아이템 포함 여부
     */
    async loadItems(payload: { roadmapType?: RoadmapType; includeInactive?: boolean } = {}) {
      this.loading = true
      this.error = ''
      try {
        this.roadmapType = payload.roadmapType ?? this.roadmapType
        const res = await this.api.fetchItems({
          roadmapType: this.roadmapType,
          includeInactive: payload.includeInactive ?? false,
          page: 0,
          size: 10000,
        })

        const mapped: Array<Record<string, unknown>> = ((res || []) as Array<Record<string, unknown>>).map((item) => ({
          id: String(item.id),
          itemLink: String(item.id),
          title: nameByLang(item),
          titleEn: String(item.nameEn ?? ''),
          content: nameByLang(item),
          start: convertDate(String(item.devStartPlanMonth ?? '')),
          end: convertDate(String(item.devEndPlanMonth ?? ''), true),
          group: String(item.roadOrgGroupProdLinkId ?? ''),
          order: Number(item.seqIndex ?? 0),
          className: 'timeline-item-active priority-high',
          itemStatusCode: String(item.itemStatusCode ?? ''),
          itemProgStatusCode: String(item.itemProgStatusCode ?? ''),
          prevGenDiff: String(item.prevGenDiff ?? ''),
          vehicle: String(item.vehicleTypeCode ?? ''),
          user: String(item.updateUserId ?? ''),
          organizationNm: String(item.roadOrgGroupProdLinkId ?? ''),
          customerCode: String(item.customerCode ?? ''),
          carModel: String(item.vehicleTypeCode ?? ''),
          roadId: String(item.roadId ?? ''),
          sopPlanMonth: String(item.sopPlanMonth ?? ''),
          updateDate: String(item.updateDate ?? ''),
          roadmapType: this.roadmapType,
          validityStatusNm: String(item.itemStatusCode ?? ''),
          validityStatus: String(item.itemStatusCode ?? ''),
          trmCount: Number(item.trmCount ?? 0),
          hasTrm: Number(item.trmCount ?? 0) > 0,
          ptrmType: 'PRM',
          priority: Number(item.seqIndex ?? 0),
          writingStatusNm: '작성완료',
          writingStatus: 'code002',
          projectPlanningStatusNm: '과제계획 미수립',
          projectExecutionStatusNm: '실행 미연계',
          projectExecutionStatus: 'code011',
        }))

        const derivedGroups: Array<Record<string, unknown>> = Array.from(
          new Map(
            mapped.map((item: Record<string, unknown>) => [
              String(item.group),
              {
                id: String(item.group),
                content: String(item.organizationNm || item.group),
                order: Number(item.order ?? 0),
                visible: true,
                nestedGroups: [],
                isOrganization: false,
                isSubGroup: false,
              },
            ]),
          ).values(),
        )

        this.items = mapped
        this.itemsDS.clear()
        this.itemsDS.add(mapped as never[])
        this.setGroups(derivedGroups)
      } catch (error) {
        this.error = error instanceof Error ? error.message : '로드맵 데이터를 불러오지 못했습니다.'
      } finally {
        this.loading = false
      }
    },

    /**
     * 지정한 PRM 아이템 ID 목록에 대한 TRM(기술 로드맵) 아이템을 병렬로 불러옵니다.
     *
     * - productItemIds별로 fetchTrm() 를 동시 호출해 응답 시간을 최소화합니다.
     * - 결과는 flat하게 합쳐(pages.flat()) 반환됩니다.
     * - useTimeline.ts의 loadSubTechItems()에서 지연로딩(lazy load) 시 사용합니다.
     *
     * @param payload.roadmapType - 'TRM' 또는 'COM'
     * @param payload.productItemIds - 부모 PRM 아이템의 ID 목록
     * @param payload.includeInactive - 비활성 포함 여부
     * @returns TRM 아이템 배열 (vis-timeline 호환 형식으로 매핑됨)
     */
    async getTrms(payload: { roadmapType?: RoadmapType; productItemIds?: string[]; includeInactive?: boolean }) {
      const roadmapType = payload.roadmapType ?? 'TRM'
      const ids = payload.productItemIds ?? []
      if (ids.length === 0) return []

      const pages = await Promise.all(
        ids.map((itemId) =>
          this.api.fetchTrm(itemId, {
            roadmapType,
            includeInactive: payload.includeInactive ?? false,
            page: 0,
            size: 10000,
          }),
        ),
      )

      return pages.flat().map((item: Record<string, unknown>, index: number) => ({
        id: String(item.id),
        itemId: String(item.itemId ?? ''),
        parentItemId: String(item.parentItemId ?? item.itemId ?? ''),
        title: nameByLang(item),
        titleEn: String(item.nameEn ?? ''),
        content: nameByLang(item),
        start: convertDate(String(item.devStartPlanMonth ?? '')),
        end: convertDate(String(item.devEndPlanMonth ?? ''), true),
        group: String(item.technologyClassLv3Id ?? item.comTechTypeCode ?? ''),
        order: index,
        className: 'timeline-item-active priority-high',
        comTechTypeId: String(item.comTechTypeId ?? ''),
        itemStatusCode: String(item.techStatusCode ?? ''),
        itemProgStatusCode: String(item.techProgStatusCode ?? ''),
        technologyClassLv1Id: String(item.technologyClassLv1Id ?? ''),
        technologyClassLv2Id: String(item.technologyClassLv2Id ?? ''),
        technologyClassLv3Id: String(item.technologyClassLv3Id ?? ''),
        techTypeCode: String(item.techTypeCode ?? ''),
        vehicle: String(item.vehicleTypeCode ?? ''),
        user: String(item.updateUserId ?? ''),
        organizationNm: String(item.orgGroupNameKo ?? item.orgGroupNameEn ?? ''),
        roadId: String(item.roadId ?? ''),
        updateDate: String(item.updateDate ?? ''),
        roadmapType,
        validityStatus: String(item.techStatusCode ?? ''),
        ptrmType: roadmapType,
        hasTrm: false,
        writingStatus: 'code002',
        writingStatusNm: '작성완료',
        technologyClassLv1Name: String(item.technologyClassLv1Id ?? ''),
        technologyClassLv2Name: String(item.technologyClassLv2Id ?? ''),
        technologyClassLv3Name: String(item.technologyClassLv3Id ?? ''),
      }))
    },
  },
})
