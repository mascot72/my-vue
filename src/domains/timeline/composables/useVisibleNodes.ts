import { computed, type Ref } from 'vue'
import type { TreeNode } from '../types/tree.types'

/**
 * 펼쳐진 노드들을 트리 순서대로 수집하는 Composable
 */
export function useVisibleNodes(nodes: Ref<Record<string, TreeNode>>) {
  // 노드를 재귀적으로 수집
  const collectVisibleNodes = (nodeId: string, result: TreeNode[] = []): void => {
    const node = nodes.value[nodeId]
    if (!node) return

    result.push(node)

    // 펼쳐진 노드의 자식들도 수집
    if (node.isExpanded && node.childrenIds) {
      node.childrenIds.forEach(childId => collectVisibleNodes(childId, result))
    }
  }

  // 모든 visible 노드들 (트리 순서 유지)
  const visibleNodes = computed(() => {
    const result: TreeNode[] = []
    
    // 루트 노드들을 정렬하여 시작
    const rootNodeIds = Object.values(nodes.value)
      .filter(node => node.level === 1)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(node => node.id)

    rootNodeIds.forEach(rootId => collectVisibleNodes(rootId, result))
    
    return result
  })

  // Visible 노드 ID 집합
  const visibleNodeIds = computed(() => {
    return new Set(visibleNodes.value.map(node => node.id))
  })

  return {
    visibleNodes,
    visibleNodeIds,
  }
}
