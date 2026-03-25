import type { TreeNodeData } from '../types/tree.types'
import type { ItemCard } from '../types/item.types'
import type { TimelineItem } from '../types'
import { fetchRootNodes } from './tree.api'
import { fetchAllItems, fetchItemById } from './items.api'

/**
 * 백엔드 로드맵 프로젝트 데이터 응답 형식
 */
export interface RoadmapProjectData {
  groups: TreeNodeData[]
  tasks: ItemCard[]
}

/**
 * 백엔드에서 전체 프로젝트 데이터를 조회
 * - GET /api/tree/roots  → Level 1 트리 노드 (groups)
 * - GET /api/items/all   → 전체 아이템 flat 배열 (tasks)
 */
export const fetchTimelineProject = async (): Promise<RoadmapProjectData> => {
  const [groups, tasks] = await Promise.all([
    fetchRootNodes(),
    fetchAllItems(),
  ])
  return { groups, tasks }
}

/**
 * 특정 아이템 상세 정보 조회
 * GET /api/items/:itemId
 */
export const fetchTaskDetails = async (itemId: string): Promise<ItemCard | null> => {
  return fetchItemById(itemId)
}

const toTimelineItem = (item: ItemCard): TimelineItem => ({
  id: item.id,
  content: item.title,
  start: item.start,
  end: item.end,
  group: item.groupId,
  title: item.description,
  className: `status-${item.status} priority-${item.priority}`,
})

/**
 * 기존 Timeline Store 호환 API
 * GET /api/items/all 응답을 TimelineItem 배열로 변환하여 반환
 */
export const fetchTimelineItems = async (): Promise<TimelineItem[]> => {
  const items = await fetchAllItems()
  return items.map(toTimelineItem)
}

