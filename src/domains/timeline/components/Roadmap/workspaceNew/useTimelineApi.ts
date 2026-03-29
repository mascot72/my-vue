import { api } from '@/shared/api/axios'

type QueryPayload = {
  roadmapType?: 'PRM' | 'TRM' | 'COM'
  includeInactive?: boolean
  page?: number
  size?: number
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
  const fetchItems = async (payload: QueryPayload = {}) => {
    const query = toParams(payload)
    const res = await api.get(`/workspace-roadmap/items?${query}`)
    return res?.content ?? []
  }

  const fetchTechs = async (itemId: string, payload: QueryPayload = {}) => {
    const query = toParams(payload)
    const res = await api.get(`/workspace-roadmap/items/${itemId}/techs?${query}`)
    return res?.content ?? []
  }

  const fetchTrm = async (itemId: string, payload: QueryPayload = {}) => {
    const query = toParams(payload)
    const res = await api.get(`/workspace-roadmap/items/${itemId}/trm?${query}`)
    return res?.content ?? []
  }

  return {
    fetchItems,
    fetchTechs,
    fetchTrm,
  }
}
