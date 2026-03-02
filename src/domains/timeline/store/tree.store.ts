import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TreeNode, TreeNodeData } from '../types/tree.types'
import { fetchRootNodes, fetchChildNodes } from '../api/tree.api'

export const useTreeStore = defineStore('tree', () => {
  // State - 심플한 객체 구조로 변경
  const nodes = ref<Record<string, TreeNode>>({})
  const expandedNodeIds = ref<Set<string>>(new Set())
  const selectedNodeId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const rootNodes = computed(() => {
    return Object.values(nodes.value).filter((node) => node.level === 1)
  })

  const selectedNode = computed(() => {
    return selectedNodeId.value ? nodes.value[selectedNodeId.value] : null
  })

  // Helper: 특정 노드 가져오기
  const getNode = (nodeId: string): TreeNode | undefined => {
    return nodes.value[nodeId]
  }

  // Helper: 자식 노드들 가져오기 (항상 최신 상태)
  const getChildren = (nodeId: string): TreeNode[] => {
    const node = nodes.value[nodeId]
    if (!node || !node.childrenIds || node.childrenIds.length === 0) {
      return []
    }
    return node.childrenIds
      .map(childId => nodes.value[childId])
      .filter((child): child is TreeNode => child !== undefined)
  }

  // Actions
  const convertToTreeNode = (data: TreeNodeData): TreeNode => {
    return {
      ...data,
      childrenIds: [], // ✅ 빈 ID 배열로 초기화
      isExpanded: expandedNodeIds.value.has(data.id),
      isLoading: false,
    }
  }

  const addNode = (nodeData: TreeNodeData) => {
    const node = convertToTreeNode(nodeData)
    nodes.value[node.id] = node
  }

  const updateNode = (nodeId: string, updates: Partial<TreeNode>) => {
    const node = nodes.value[nodeId]
    if (node) {
      Object.assign(node, updates)
    }
  }

  const loadRootNodes = async () => {
    loading.value = true
    error.value = null
    try {
      const rootNodesData = await fetchRootNodes()
      rootNodesData.forEach((nodeData) => {
        addNode(nodeData)
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load root nodes'
      console.error('Error loading root nodes:', err)
    } finally {
      loading.value = false
    }
  }

  const loadChildren = async (parentId: string) => {
    const parentNode = nodes.value[parentId]
    if (!parentNode) return

    updateNode(parentId, { isLoading: true })
    
    try {
      const childrenData = await fetchChildNodes(parentId)
      
      // 자식 노드들을 먼저 추가
      childrenData.forEach((childData) => {
        addNode(childData)
      })
      
      // 자식 ID 배열 생성
      const childrenIds: string[] = childrenData.map(childData => childData.id)
      
      // 부모 노드 업데이트
      updateNode(parentId, { 
        childrenIds,
        isLoading: false 
      })
    } catch (err) {
      console.error('[Store] Error loading children:', err)
      updateNode(parentId, { isLoading: false })
    }
  }

  const toggleNode = async (nodeId: string) => {
    const node = nodes.value[nodeId]
    if (!node) return

    const isExpanding = !node.isExpanded
    
    if (isExpanding) {
      // 펼치기
      expandedNodeIds.value.add(nodeId)
      updateNode(nodeId, { isExpanded: true })
      
      // 자식 로드가 필요한 경우
      if (node.hasChildren && (!node.childrenIds || node.childrenIds.length === 0)) {
        await loadChildren(nodeId)
      }
    } else {
      // 접기
      expandedNodeIds.value.delete(nodeId)
      updateNode(nodeId, { isExpanded: false })
    }
  }

  const selectNode = (nodeId: string) => {
    const node = nodes.value[nodeId]
    if (!node) return
    
    // 리프 노드만 선택
    if (!node.hasChildren || node.level === 4) {
      selectedNodeId.value = nodeId
    }
  }

  const clearSelection = () => {
    selectedNodeId.value = null
  }

  const expandAll = async () => {
    const expandNodeRecursively = async (nodeId: string) => {
      const node = nodes.value[nodeId]
      if (!node || !node.hasChildren) return

      // 펼치기
      expandedNodeIds.value.add(nodeId)
      updateNode(nodeId, { isExpanded: true })
      
      // 자식 로드
      if (!node.childrenIds || node.childrenIds.length === 0) {
        await loadChildren(nodeId)
      }
      
      // 자식들도 재귀적으로 펼치기
      const children = getChildren(nodeId)
      for (const child of children) {
        await expandNodeRecursively(child.id)
      }
    }

    // 모든 루트 노드부터 시작
    for (const rootNode of rootNodes.value) {
      await expandNodeRecursively(rootNode.id)
    }
  }

  const collapseAll = () => {
    expandedNodeIds.value.clear()
    Object.values(nodes.value).forEach(node => {
      node.isExpanded = false
    })
  }

  const reset = () => {
    nodes.value = {}
    expandedNodeIds.value.clear()
    selectedNodeId.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    nodes,
    expandedNodeIds,
    selectedNodeId,
    loading,
    error,
    
    // Computed
    rootNodes,
    selectedNode,
    
    // Helpers
    getNode,
    getChildren,
    
    // Actions
    loadRootNodes,
    loadChildren,
    toggleNode,
    selectNode,
    clearSelection,
    expandAll,
    collapseAll,
    reset,
  }
})
