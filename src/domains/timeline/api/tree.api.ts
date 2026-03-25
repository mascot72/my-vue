import type { TreeNodeData } from '../types/tree.types'
import { api } from '@/shared/api/axios'

/**
 * Tree API
 * Backend server와 연동하여 데이터를 가져옵니다
 */

/**
 * 루트 노드 조회 (Level 1)
 */
export const fetchRootNodes = async (): Promise<TreeNodeData[]> => {
  return api.get('/tree/roots')
}

/**
 * 특정 부모의 자식 노드 조회
 */
export const fetchChildNodes = async (parentId: string): Promise<TreeNodeData[]> => {
  return api.get(`/tree/${parentId}/children`)
}

/**
 * 특정 노드 정보 조회
 */
export const fetchNodeById = async (nodeId: string): Promise<TreeNodeData | null> => {
  try {
    return await api.get(`/tree/${nodeId}`)
  } catch (error) {
    console.error('Error fetching node:', error)
    return null
  }
}

/**
 * 전체 트리 노드 조회
 * roots부터 children endpoint를 순회하여 모든 레벨 노드를 수집합니다.
 */
export const fetchAllTreeNodes = async (): Promise<TreeNodeData[]> => {
  const roots = await fetchRootNodes()
  const allNodes: TreeNodeData[] = [...roots]
  const queue = [...roots]

  while (queue.length > 0) {
    const parent = queue.shift()
    if (!parent || !parent.hasChildren) continue

    const children = await fetchChildNodes(parent.id)
    if (!children.length) continue

    allNodes.push(...children)
    queue.push(...children)
  }

  const deduped = new Map<string, TreeNodeData>()
  allNodes.forEach((node) => deduped.set(node.id, node))
  return Array.from(deduped.values())
}
