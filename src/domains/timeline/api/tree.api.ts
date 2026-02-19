import type { TreeNodeData } from '../types/tree.types'

/**
 * Tree API
 * 실제 환경에서는 실제 API 엔드포인트로 교체 필요
 */

// Mock 데이터 - 실제로는 서버에서 가져옴
const mockTreeData: TreeNodeData[] = [
  // Level 1
  { id: '1', name: 'Engineering', level: 1, hasChildren: true },
  { id: '2', name: 'Marketing', level: 1, hasChildren: true },
  { id: '3', name: 'Sales', level: 1, hasChildren: true },
  
  // Level 2 - Engineering
  { id: '1-1', name: 'Frontend', level: 2, parentId: '1', hasChildren: true },
  { id: '1-2', name: 'Backend', level: 2, parentId: '1', hasChildren: true },
  { id: '1-3', name: 'DevOps', level: 2, parentId: '1', hasChildren: true },
  
  // Level 2 - Marketing
  { id: '2-1', name: 'Digital Marketing', level: 2, parentId: '2', hasChildren: true },
  { id: '2-2', name: 'Content', level: 2, parentId: '2', hasChildren: true },
  
  // Level 2 - Sales
  { id: '3-1', name: 'Enterprise', level: 2, parentId: '3', hasChildren: true },
  { id: '3-2', name: 'SMB', level: 2, parentId: '3', hasChildren: true },
  
  // Level 3 - Frontend
  { id: '1-1-1', name: 'Vue Team', level: 3, parentId: '1-1', hasChildren: true },
  { id: '1-1-2', name: 'React Team', level: 3, parentId: '1-1', hasChildren: true },
  
  // Level 3 - Backend
  { id: '1-2-1', name: 'API Services', level: 3, parentId: '1-2', hasChildren: true },
  { id: '1-2-2', name: 'Database', level: 3, parentId: '1-2', hasChildren: true },
  
  // Level 3 - DevOps
  { id: '1-3-1', name: 'Infrastructure', level: 3, parentId: '1-3', hasChildren: true },
  { id: '1-3-2', name: 'CI/CD', level: 3, parentId: '1-3', hasChildren: true },
  
  // Level 4 - Vue Team (leaf nodes)
  { id: '1-1-1-1', name: 'Component Library', level: 4, parentId: '1-1-1', hasChildren: false },
  { id: '1-1-1-2', name: 'State Management', level: 4, parentId: '1-1-1', hasChildren: false },
  { id: '1-1-1-3', name: 'Routing', level: 4, parentId: '1-1-1', hasChildren: false },
  
  // Level 4 - React Team (leaf nodes)
  { id: '1-1-2-1', name: 'Hooks Library', level: 4, parentId: '1-1-2', hasChildren: false },
  { id: '1-1-2-2', name: 'Context API', level: 4, parentId: '1-1-2', hasChildren: false },
  
  // Level 4 - API Services (leaf nodes)
  { id: '1-2-1-1', name: 'REST API', level: 4, parentId: '1-2-1', hasChildren: false },
  { id: '1-2-1-2', name: 'GraphQL', level: 4, parentId: '1-2-1', hasChildren: false },
  
  // Level 4 - Database (leaf nodes)
  { id: '1-2-2-1', name: 'PostgreSQL', level: 4, parentId: '1-2-2', hasChildren: false },
  { id: '1-2-2-2', name: 'Redis', level: 4, parentId: '1-2-2', hasChildren: false },
]

/**
 * 루트 노드 조회 (Level 1)
 */
export const fetchRootNodes = async (): Promise<TreeNodeData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const roots = mockTreeData.filter((node) => node.level === 1)
      resolve(roots)
    }, 500)
  })
}

/**
 * 특정 부모의 자식 노드 조회
 */
export const fetchChildNodes = async (parentId: string): Promise<TreeNodeData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const children = mockTreeData.filter((node) => node.parentId === parentId)
      resolve(children)
    }, 300)
  })
}

/**
 * 특정 노드 정보 조회
 */
export const fetchNodeById = async (nodeId: string): Promise<TreeNodeData | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const node = mockTreeData.find((node) => node.id === nodeId)
      resolve(node || null)
    }, 200)
  })
}
