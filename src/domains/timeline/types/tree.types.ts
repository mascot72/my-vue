/**
 * Tree 구조 관련 타입 정의
 */

export interface TreeNode {
  id: string
  name: string
  level: number // 1~4 depth
  parentId?: string
  childrenIds: string[] // ✅ 자식 ID만 저장 (Best Practice)
  hasChildren: boolean
  isExpanded: boolean
  isLoading: boolean
}

export interface TreeNodeData {
  id: string
  name: string
  level: number
  parentId?: string
  hasChildren: boolean
}

export interface TreeState {
  nodes: Map<string, TreeNode>
  rootNodes: TreeNode[]
  expandedNodeIds: Set<string>
  selectedNodeId: string | null
}
