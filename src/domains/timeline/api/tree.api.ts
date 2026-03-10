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
