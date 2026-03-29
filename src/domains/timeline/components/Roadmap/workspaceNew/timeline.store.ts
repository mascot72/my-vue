import { defineStore } from 'pinia'
import { DataSet } from 'vis-data'
import { reactive } from 'vue'
import { useTimelineApi } from './useTimelineApi'

type RoadmapType = 'PRM' | 'TRM' | 'COM'

const convertDate = (value: string, endOfMonth = false) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  if (!endOfMonth) return date

  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

const nameByLang = (item: Record<string, unknown>, langCode = 'Ko') => {
  const key = `name${langCode}`
  return String(item[key] ?? item.nameKo ?? item.nameEn ?? '')
}

type DdCodeEntry = {
  code?: string
  codeNameKo?: string
  [key: string]: unknown
}

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

// Bridge Storage: 여러 action이 공유하는 스토어 외부 선언
const commCodeMap = reactive(new Map<string, DdCodeEntry[]>())
const langCode = 'Ko' // Default language

export const useWorkspaceNewTimelineStore = defineStore('roadmap:workspace-new:timeline', {
  state: () => ({
    groups: [] as Array<Record<string, unknown>>,
    items: [] as Array<Record<string, unknown>>,
    groupsDS: new DataSet([]),
    itemsDS: new DataSet([]),
    orgGroups: [] as Array<Record<string, unknown>>,
    useSubTechCache: true,
    subTechCacheByParentId: {} as Record<string, Array<Record<string, unknown>>>,
    groupItemCacheByGroupId: {} as Record<string, Array<Record<string, unknown>>>,
    loading: false,
    error: '' as string,
    roadmapType: 'PRM' as RoadmapType,
  }),

  getters: {
    api: () => useTimelineApi(),
    rootItems: (state) => state.items.filter((item) => item.ptrmType === 'PRM'),
  },

  actions: {
    // ===== DD Code 관리 =====
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

    getDdName(masterCode: string, code: string): string {
      const codes = commCodeMap.get(masterCode)
      if (!codes) return code
      const found = codes.find((c) => c.code === code)
      return found ? found[`codeName${langCode}`] ?? found.codeNameKo ?? code : code
    },

    // ===== 조직/부서 그룹 로드 =====
    async loadOrgGroups(payload: { roadmapType?: RoadmapType } = {}) {
      this.loading = true
      try {
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

    // ===== 그룹 로드 (트리 구조 포함) =====
    async loadGroups(payload: { roadmapType?: RoadmapType; langCode?: string } = {}) {
      this.loading = true
      this.error = ''
      try {
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

    // ===== 하위기술 캐싱 관리 =====
    setSubTechCacheEnabled(enabled: boolean) {
      this.useSubTechCache = enabled
      if (!enabled) {
        this.subTechCacheByParentId = {}
      }
    },

    getCachedSubTechItems(parentId: string) {
      const cached = this.subTechCacheByParentId[parentId]
      if (!cached) return []
      return cached.map((item) => ({ ...item }))
    },

    cacheSubTechItems(parentId: string, items: Array<Record<string, unknown>>) {
      this.subTechCacheByParentId[parentId] = items.map((item) => ({ ...item }))
    },

    clearSubTechCache(parentId?: string) {
      if (!parentId) {
        this.subTechCacheByParentId = {}
        return
      }
      delete this.subTechCacheByParentId[parentId]
    },

    // ===== 그룹 아이템 캐싱 =====
    getCachedGroupItems(groupId: string) {
      const cached = this.groupItemCacheByGroupId[groupId]
      if (!cached) return []
      return cached.map((item) => ({ ...item }))
    },

    cacheGroupItems(groupId: string, items: Array<Record<string, unknown>>) {
      this.groupItemCacheByGroupId[groupId] = items.map((item) => ({ ...item }))
    },

    clearGroupItemCache(groupId?: string) {
      if (!groupId) {
        this.groupItemCacheByGroupId = {}
        return
      }
      delete this.groupItemCacheByGroupId[groupId]
    },



    setGroups(groups: Array<Record<string, unknown>>) {
      this.groups = groups
      this.groupsDS.clear()
      this.groupsDS.add(groups as never[])
    },

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
