import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TreeNode, TreeNodeData } from '../types/tree.types'
import { fetchRootNodes, fetchChildNodes } from '../api/tree.api'

export const useTreeStore = defineStore('tree', () => {
  // State
  const nodes = ref<Map<string, TreeNode>>(new Map())
  const expandedNodeIds = ref<Set<string>>(new Set())
  const selectedNodeId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const rootNodes = computed(() => {
    return Array.from(nodes.value.values()).filter((node) => node.level === 1)
  })

  const selectedNode = computed(() => {
    return selectedNodeId.value ? nodes.value.get(selectedNodeId.value) : null
  })

  // Actions
  const convertToTreeNode = (data: TreeNodeData): TreeNode => {
    return {
      ...data,
      children: [],
      isExpanded: expandedNodeIds.value.has(data.id),
      isLoading: false,
    }
  }

  const addNode = (nodeData: TreeNodeData) => {
    const node = convertToTreeNode(nodeData)
    nodes.value.set(node.id, node)
  }

  const updateNode = (nodeId: string, updates: Partial<TreeNode>) => {
    const node = nodes.value.get(nodeId)
    if (node) {
      nodes.value.set(nodeId, { ...node, ...updates })
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
    const parentNode = nodes.value.get(parentId)
    if (!parentNode) return

    updateNode(parentId, { isLoading: true })
    try {
      const childrenData = await fetchChildNodes(parentId)
      const children: TreeNode[] = []
      
      childrenData.forEach((childData) => {
        addNode(childData)
        const childNode = nodes.value.get(childData.id)
        if (childNode) {
          children.push(childNode)
        }
      })

      updateNode(parentId, { children, isLoading: false })
    } catch (err) {
      console.error('Error loading children:', err)
      updateNode(parentId, { isLoading: false })
    }
  }

  const toggleNode = async (nodeId: string) => {
    const node = nodes.value.get(nodeId)
    if (!node) return

    const isExpanding = !node.isExpanded
    
    // 펼치기
    if (isExpanding) {
      expandedNodeIds.value.add(nodeId)
      updateNode(nodeId, { isExpanded: true })
      
      // 자식이 아직 로드되지 않았으면 로드
      if (node.hasChildren && (!node.children || node.children.length === 0)) {
        await loadChildren(nodeId)
      }
    } 
    // 접기
    else {
      expandedNodeIds.value.delete(nodeId)
      updateNode(nodeId, { isExpanded: false })
    }
  }

  const selectNode = (nodeId: string) => {
    selectedNodeId.value = nodeId
    const node = nodes.value.get(nodeId)
    
    // 리프 노드인 경우에만 선택 (level 4 또는 hasChildren이 false)
    if (node && (!node.hasChildren || node.level === 4)) {
      selectedNodeId.value = nodeId
    }
  }

  const clearSelection = () => {
    selectedNodeId.value = null
  }

  const getNodeChildren = (nodeId: string): TreeNode[] => {
    const node = nodes.value.get(nodeId)
    return node?.children || []
  }

  const reset = () => {
    nodes.value.clear()
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
    
    // Actions
    loadRootNodes,
    loadChildren,
    toggleNode,
    selectNode,
    clearSelection,
    getNodeChildren,
    reset,
  }
})
