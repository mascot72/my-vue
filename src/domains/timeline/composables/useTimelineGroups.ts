import { computed, type Ref } from 'vue'
import type { TreeNode } from '../types/tree.types'
import type { TimelineGroup } from 'vis-timeline'

/**
 * 노드 아이콘 결정
 */
const getNodeIcon = (node: TreeNode): string => {
  if (!node.hasChildren) return '📄'
  return node.isExpanded ? '📂' : '📁'
}

/**
 * TreeNode를 TimelineGroup으로 변환
 */
const createTimelineGroup = (node: TreeNode, order: number): TimelineGroup => {
  const icon = getNodeIcon(node)
  
  return {
    id: node.id,
    content: `<div class="timeline-group-label" data-level="${node.level}">
      <span class="timeline-group-icon">${icon}</span>
      <span class="timeline-group-name">${node.name}</span>
    </div>`,
    title: node.name,
    level: node.level,
    order,
  }
}

/**
 * TreeNode 배열을 Timeline Groups로 변환하는 Composable
 */
export function useTimelineGroups(visibleNodes: Ref<TreeNode[]>) {
  const timelineGroups = computed<TimelineGroup[]>(() => {
    return visibleNodes.value.map((node, index) => 
      createTimelineGroup(node, index)
    )
  })

  return {
    timelineGroups,
  }
}
