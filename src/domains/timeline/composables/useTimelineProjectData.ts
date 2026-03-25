import { ref, computed } from 'vue'
import { fetchTimelineProject, fetchTaskDetails } from '../api/timeline.api'
import {
  transformBackendProjectToTimeline,
  transformBackendItemToTaskDetailHtml,
} from '../utils/dataTransformer'
import type { ProjectTask, TransformedTimelineData } from '../types'
import type { ItemCard } from '../types/item.types'

/**
 * Timeline 프로젝트 데이터를 관리하는 Composable
 * - API 호출
 * - 데이터 변환
 * - 에러 처리
 * - 로딩 상태
 */
export const useTimelineProjectData = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<TransformedTimelineData | null>(null)
  const selectedTaskId = ref<string | null>(null)
  const selectedTaskDetail = ref<ItemCard | null>(null)
  const selectedTaskDetailHtml = ref<string | null>(null)

  /**
   * 프로젝트 데이터 로드
   */
  const loadProject = async () => {
    loading.value = true
    error.value = null

    try {
      const project = await fetchTimelineProject()
      data.value = transformBackendProjectToTimeline(project.groups, project.tasks)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load project data'
      console.error('Error loading project:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 특정 작업 상세 정보 조회
   */
  const selectTask = async (taskId: string) => {
    selectedTaskId.value = taskId
    try {
      selectedTaskDetail.value = await fetchTaskDetails(taskId)
      if (selectedTaskDetail.value) {
        selectedTaskDetailHtml.value = transformBackendItemToTaskDetailHtml(selectedTaskDetail.value)
      }
    } catch (err) {
      console.error('Error loading task details:', err)
    }
  }

  /**
   * 선택 초기화
   */
  const clearSelection = () => {
    selectedTaskId.value = null
    selectedTaskDetail.value = null
    selectedTaskDetailHtml.value = null
  }

  /**
   * Timeline Items (computed)
   */
  const items = computed(() => data.value?.items || [])

  /**
   * Timeline Groups (computed)
   */
  const groups = computed(() => data.value?.groups || [])

  /**
   * 그룹별 아이템 개수
   */
  const getTaskCountByGroup = (groupId: number) => {
    return items.value.filter((item) => item.group === groupId).length
  }

  /**
   * 진행률 통계
   */
  const getProgressStats = () => {
    if (items.value.length === 0) return { completed: 0, inProgress: 0, planning: 0, onHold: 0 }

    const stats = items.value.reduce(
      (acc, item) => {
        const className = item.className || ''
        if (className.includes('completed')) acc.completed++
        else if (className.includes('in-progress')) acc.inProgress++
        else if (className.includes('planning')) acc.planning++
        else if (className.includes('on-hold')) acc.onHold++
        return acc
      },
      { completed: 0, inProgress: 0, planning: 0, onHold: 0 },
    )

    return stats
  }

  return {
    // 상태
    loading,
    error,
    data,
    selectedTaskId,
    selectedTaskDetail,
    selectedTaskDetailHtml,

    // 계산된 속성
    items,
    groups,

    // 메서드
    loadProject,
    selectTask,
    clearSelection,
    getTaskCountByGroup,
    getProgressStats,
  }
}
