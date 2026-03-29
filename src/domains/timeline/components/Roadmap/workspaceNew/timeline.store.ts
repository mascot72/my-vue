import { defineStore } from 'pinia'
import { DataSet } from 'vis-data'
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

export const useWorkspaceNewTimelineStore = defineStore('roadmap:workspace-new:timeline', {
  state: () => ({
    groups: [] as Array<Record<string, unknown>>,
    items: [] as Array<Record<string, unknown>>,
    groupsDS: new DataSet([]),
    itemsDS: new DataSet([]),
    useSubTechCache: true,
    subTechCacheByParentId: {} as Record<string, Array<Record<string, unknown>>>,
    loading: false,
    error: '' as string,
    roadmapType: 'PRM' as RoadmapType,
  }),

  getters: {
    api: () => useTimelineApi(),
    rootItems: (state) => state.items.filter((item) => item.ptrmType === 'PRM'),
  },

  actions: {
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
