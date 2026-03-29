import { api } from '@/shared/api/axios'

type QueryPayload = {
  roadmapType?: 'PRM' | 'TRM' | 'COM'
  includeInactive?: boolean
  page?: number
  size?: number
}

type TimelineLikeItem = {
  id?: string
  nameKo?: string
  nameEn?: string
  roadOrgGroupProdLinkId?: string
  seqIndex?: number
}

const toParams = (payload: QueryPayload = {}) => {
  const params = new URLSearchParams()
  if (payload.roadmapType) params.set('roadmapType', payload.roadmapType)
  if (payload.includeInactive !== undefined) params.set('includeInactive', String(payload.includeInactive))
  params.set('page', String(payload.page ?? 0))
  params.set('size', String(payload.size ?? 10000))
  return params.toString()
}

export const useTimelineApi = () => {
  const fetchDdCode = async (masterCode: string): Promise<Array<Record<string, unknown>>> => {
    if (masterCode !== 'TES.ROAD_STATUS') return []

    return [
      { code: 'ACTIVE', codeNameKo: '진행' },
      { code: 'IN_PROGRESS', codeNameKo: '진행중' },
      { code: 'PLANNING', codeNameKo: '계획' },
      { code: 'COMPLETED', codeNameKo: '완료' },
      { code: 'DONE', codeNameKo: '완료' },
      { code: 'HOLD', codeNameKo: '보류' },
      { code: 'ON_HOLD', codeNameKo: '보류' },
    ]
  }

  const fetchItems = async (payload: QueryPayload = {}): Promise<Array<Record<string, unknown>>> => {
    const query = toParams(payload)
    const res = (await api.get(`/workspace-roadmap/items?${query}`)) as { content?: unknown[] }
    return (res?.content ?? []) as Array<Record<string, unknown>>
  }

  const fetchOrgGroups = async (payload: QueryPayload = {}): Promise<Array<Record<string, unknown>>> => {
    const items = (await fetchItems(payload)) as TimelineLikeItem[]
    const orgMap = new Map<string, { id: string; nameKo: string; nameEn: string; seqOrder: number }>()

    items.forEach((item) => {
      const groupCode = String(item.roadOrgGroupProdLinkId ?? '')
      if (!groupCode) return
      const [orgSegment] = groupCode.split('-')
      if (!orgSegment) return

      const orgId = `ORG-${orgSegment}`
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          id: orgId,
          nameKo: `조직 ${orgSegment}`,
          nameEn: `Organization ${orgSegment}`,
          seqOrder: Number(orgSegment) || orgMap.size + 1,
        })
      }
    })

    return Array.from(orgMap.values()) as Array<Record<string, unknown>>
  }

  const fetchGroups = async (payload: QueryPayload = {}): Promise<Array<Record<string, unknown>>> => {
    const items = (await fetchItems(payload)) as TimelineLikeItem[]
    const groupsMap = new Map<
      string,
      { id: string; nameKo: string; nameEn: string; parent?: string; seqIndex: number }
    >()

    items.forEach((item) => {
      const groupCode = String(item.roadOrgGroupProdLinkId ?? '')
      if (!groupCode || groupsMap.has(groupCode)) return

      const [orgSegment] = groupCode.split('-')
      groupsMap.set(groupCode, {
        id: groupCode,
        nameKo: String(item.nameKo ?? groupCode),
        nameEn: String(item.nameEn ?? groupCode),
        parent: orgSegment ? `ORG-${orgSegment}` : undefined,
        seqIndex: Number(item.seqIndex ?? groupsMap.size + 1),
      })
    })

    return Array.from(groupsMap.values()) as Array<Record<string, unknown>>
  }

  const fetchTechs = async (
    itemId: string,
    payload: QueryPayload = {},
  ): Promise<Array<Record<string, unknown>>> => {
    const query = toParams(payload)
    const res = (await api.get(`/workspace-roadmap/items/${itemId}/techs?${query}`)) as {
      content?: unknown[]
    }
    return (res?.content ?? []) as Array<Record<string, unknown>>
  }

  const fetchTrm = async (
    itemId: string,
    payload: QueryPayload = {},
  ): Promise<Array<Record<string, unknown>>> => {
    const query = toParams(payload)
    const res = (await api.get(`/workspace-roadmap/items/${itemId}/trm?${query}`)) as { content?: unknown[] }
    return (res?.content ?? []) as Array<Record<string, unknown>>
  }

  return {
    fetchDdCode,
    fetchGroups,
    fetchOrgGroups,
    fetchItems,
    fetchTechs,
    fetchTrm,
  }
}
