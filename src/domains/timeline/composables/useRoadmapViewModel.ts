import { computed, ref, watch } from 'vue'
import { useTimelineProjectData } from '@/domains/timeline/composables/useTimelineProjectData'

export type StatusFilter = 'all' | 'planning' | 'in-progress' | 'completed' | 'on-hold'
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical'
export type ViewMode = 'month' | 'quarter'

export interface SelectOption {
  value: string
  label: string
}

export interface SummaryCard {
  label: string
  value: number
  tone: 'slate' | 'blue' | 'indigo' | 'green'
}

export const useRoadmapViewModel = () => {
  const {
    loading,
    error,
    items,
    groups,
    selectedTaskDetail,
    selectedTaskDetailHtml,
    loadProject,
    selectTask,
    clearSelection,
    getProgressStats,
  } = useTimelineProjectData()

  const searchText = ref('')
  const selectedGroupId = ref('all')
  const statusFilter = ref<StatusFilter>('all')
  const priorityFilter = ref<PriorityFilter>('all')
  const hideCompleted = ref(false)
  const viewMode = ref<ViewMode>('month')
  const activeItemId = ref<string | null>(null)

  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const groupOptions = computed<SelectOption[]>(() =>
    groups.value.map((group) => ({
      value: String(group.id),
      label: stripHtml(String(group.content ?? group.title ?? group.id)),
    })),
  )

  const filteredItems = computed(() => {
    const keyword = searchText.value.trim().toLowerCase()

    return items.value.filter((item) => {
      const text = `${item.title ?? ''} ${stripHtml(String(item.content ?? ''))}`.toLowerCase()
      const matchesKeyword = keyword.length === 0 || text.includes(keyword)
      const matchesGroup = selectedGroupId.value === 'all' || String(item.group) === selectedGroupId.value
      const matchesStatus =
        statusFilter.value === 'all' || item.className?.includes(`status-${statusFilter.value}`)
      const matchesPriority =
        priorityFilter.value === 'all' || item.className?.includes(`priority-${priorityFilter.value}`)
      const matchesCompleted = !hideCompleted.value || !item.className?.includes('status-completed')

      return matchesKeyword && matchesGroup && matchesStatus && matchesPriority && matchesCompleted
    })
  })

  const filteredGroups = computed(() => {
    const visibleGroupIds = new Set(filteredItems.value.map((item) => String(item.group)))
    return groups.value.filter((group) => visibleGroupIds.has(String(group.id)))
  })

  const stats = computed(() => getProgressStats())
  const visibleCount = computed(() => filteredItems.value.length)
  const totalCount = computed(() => items.value.length)

  const summaryCards = computed<SummaryCard[]>(() => [
    { label: '전체 작업', value: totalCount.value, tone: 'slate' },
    { label: '현재 표시', value: visibleCount.value, tone: 'blue' },
    { label: '진행 중', value: stats.value.inProgress, tone: 'indigo' },
    { label: '완료', value: stats.value.completed, tone: 'green' },
  ])

  const resetFilters = () => {
    searchText.value = ''
    selectedGroupId.value = 'all'
    statusFilter.value = 'all'
    priorityFilter.value = 'all'
    hideCompleted.value = false
  }

  const selectRoadmapItem = async (itemId: string) => {
    activeItemId.value = itemId
    await selectTask(itemId)
  }

  const clearRoadmapSelection = () => {
    activeItemId.value = null
    clearSelection()
  }

  watch(filteredItems, (nextItems) => {
    if (!activeItemId.value) return

    const exists = nextItems.some((item) => String(item.id) === activeItemId.value)
    if (!exists) {
      clearRoadmapSelection()
    }
  })

  const initialize = async () => {
    await loadProject()
  }

  return {
    loading,
    error,
    selectedTaskDetail,
    selectedTaskDetailHtml,
    groupOptions,
    filteredItems,
    filteredGroups,
    summaryCards,
    searchText,
    selectedGroupId,
    statusFilter,
    priorityFilter,
    hideCompleted,
    viewMode,
    activeItemId,
    resetFilters,
    selectRoadmapItem,
    clearRoadmapSelection,
    initialize,
  }
}
