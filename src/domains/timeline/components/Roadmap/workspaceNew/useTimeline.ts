import { nextTick, reactive, toRaw } from 'vue'
// @ts-expect-error legacy JS module without type declarations
import VisTimelineArrows from '../visTimelineArrow.js'

export function useTimeline(props: any, emit: any, store: any, getDdName: any, getTechNameFn: any) {
  const itemsDS = store.itemsDS
  const groupsDS = store.groupsDS
  const timelineState = reactive({
    activeArrowItemIds: [] as string[],
  })

  const loadedItems = new Set<string>()
  const pendingRequests = new Set<string>()
  let timelineInstance: any = null
  let timelineArrows: any = null

  const getArrowId = (parentId: string, childId: string) => `arrow-${parentId}-${childId}`

  const ensureArrows = () => {
    if (!timelineInstance || timelineArrows) return
    timelineArrows = new VisTimelineArrows(timelineInstance, [], {
      color: '#16a34a',
      strokeWidth: 2,
      followRelationships: true,
    })
  }

  const syncArrowForParent = async (parentId: string) => {
    ensureArrows()
    if (!timelineArrows) return

    timelineArrows.removeArrows(parentId)
    const children = itemsDS.get({ filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM' })
    children.forEach((child: any) => {
      timelineArrows.addArrow({
        id: getArrowId(parentId, String(child.id)),
        id_item_1: parentId,
        id_item_2: String(child.id),
        type: 2,
        color: '#16a34a',
      })
    })

    await nextTick()
    timelineInstance?.redraw()
  }

  const removeArrowForParent = (parentId: string) => {
    timelineArrows?.removeArrows(parentId)
    timelineInstance?.redraw()
  }

  const getDescendantGroupIds = (groupId: string) => {
    const result = new Set<string>()
    const queue: string[] = [String(groupId)]

    while (queue.length) {
      const currentId = queue.shift()
      if (!currentId || result.has(currentId)) continue
      result.add(currentId)

      const group: any = groupsDS.get(currentId)
      const nested = Array.isArray(group?.nestedGroups) ? group.nestedGroups : []
      nested.forEach((childId: unknown) => {
        const normalized = String(childId)
        if (!result.has(normalized)) {
          queue.push(normalized)
        }
      })
    }

    return Array.from(result)
  }

  const setItemsVisibleByGroupIds = (groupIds: string[], visible: boolean) => {
    const targetGroupIds = new Set(groupIds.map((id) => String(id)))
    if (!targetGroupIds.size) return

    const targetItems = itemsDS.get({
      filter: (item: any) => targetGroupIds.has(String(item.group)),
    })

    if (!targetItems.length) return

    const updates = targetItems.map((item: any) => {
      const existingStyle = String(item.style ?? '')
      const normalizedStyle = existingStyle.replace(/display\s*:\s*none;?/gi, '').trim()

      return {
        ...item,
        style: visible
          ? normalizedStyle
          : `${normalizedStyle}${normalizedStyle ? '; ' : ''}display:none;`,
      }
    })

    itemsDS.update(updates)
    timelineInstance?.redraw()
  }

  const setGroupChecked = (groupId: string, checked: boolean) => {
    const current: any = groupsDS.get(groupId)
    if (!current) return
    groupsDS.update({
      ...current,
      checked,
    })
  }

  const toggleGroupVisibility = (groupId: string, visible: boolean) => {
    const targetGroupIds = getDescendantGroupIds(groupId)
    setGroupChecked(groupId, visible)
    setItemsVisibleByGroupIds(targetGroupIds, visible)
  }

  const reloadData = (items: any[]) => {
    if (!items) return
    const processed = items.map((item) => {
      const raw = toRaw(item)
      return {
        ...raw,
        id: String(raw.id),
        group: String(raw.groupId || raw.group),
        start: raw.start ? new Date(raw.start) : null,
        end: raw.end ? new Date(raw.end) : null,
        subgroup: raw.subgroup,
        subgroupOrder: raw.subgroupOrder,
        content: '',
      }
    })

    itemsDS.clear()
    itemsDS.add(processed)
  }

  const removeSubItems = (parentId: string) => {
    const children = itemsDS.get({ filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM' })
    const removeIds = children.map((item: any) => item.id)
    if (removeIds.length) {
      itemsDS.remove(removeIds)
    }

    if (!store.useSubTechCache) {
      loadedItems.delete(parentId)
      store.clearSubTechCache(parentId)
    }

    removeArrowForParent(parentId)
  }

  const restoreCachedSubTechItems = async (parentId: string) => {
    if (!store.useSubTechCache) return false
    const cachedItems = store.getCachedSubTechItems(parentId)
    if (!cachedItems.length) return false

    const existingChildren = itemsDS.get({
      filter: (item: any) => item.itemLink === parentId && item.ptrmType !== 'PRM',
    })

    if (existingChildren.length === 0) {
      itemsDS.add(cachedItems)
    }

    loadedItems.add(parentId)
    await syncArrowForParent(parentId)
    return true
  }

  const loadSubTechItems = async (itemId: string) => {
    if (!itemId || pendingRequests.has(itemId)) return

    if (loadedItems.has(itemId)) {
      const restored = await restoreCachedSubTechItems(itemId)
      if (restored) return
      if (store.useSubTechCache) return
    }

    const parentItem: any = itemsDS.get(itemId)
    if (!parentItem || parentItem.ptrmType !== 'PRM' || Number(parentItem.trmCount || 0) <= 0) return

    const existingChildren = itemsDS.get({
      filter: (item: any) => item.itemLink === itemId && item.ptrmType !== 'PRM',
    })
    if (existingChildren.length >= Number(parentItem.trmCount || 0)) {
      loadedItems.add(itemId)
      return
    }

    pendingRequests.add(itemId)
    try {
      const trms = await store.getTrms({
        roadmapType: store.roadmapType === 'PRM' ? 'TRM' : 'COM',
        productItemIds: [itemId],
      })

      const newItems = (trms || []).filter((item: any) => itemsDS.get(item.id) === null)
      if (newItems.length) {
        const mappedItems = newItems.map((item: any, index: number) => {
          const start = new Date(parentItem.start)
          start.setDate(start.getDate() + index * 10)
          const end = new Date(start)
          end.setDate(end.getDate() + 45)

          return {
            ...item,
            itemLink: itemId,
            group: parentItem.group,
            className: 'child-trm-card',
            start,
            end,
            subgroup: `child-${itemId}-${index + 1}`,
            subgroupOrder: index + 1,
            itemStatusName: getDdName('TES.ROAD_STATUS', item.itemStatusCode),
          }
        })

        itemsDS.add(mappedItems)

        if (store.useSubTechCache) {
          store.cacheSubTechItems(itemId, mappedItems)
        }

        await syncArrowForParent(itemId)
      }

      loadedItems.add(itemId)
    } catch (error) {
      console.error('Lazy Load Error:', error)
    } finally {
      pendingRequests.delete(itemId)
    }
  }

  const visibleSubTechTree = async (visible: boolean, itemId: string) => {
    const id = String(itemId)
    if (visible) {
      if (!timelineState.activeArrowItemIds.includes(id)) {
        timelineState.activeArrowItemIds.push(id)
      }
      await loadSubTechItems(id)
      return
    }

    timelineState.activeArrowItemIds = timelineState.activeArrowItemIds.filter((value) => value !== id)
    removeSubItems(id)
  }

  const expandAllSubItems = async () => {
    const parents = itemsDS.get({ filter: (item: any) => item.ptrmType === 'PRM' && item.hasTrm })
    for (const parent of parents) {
      const id = String(parent.id)
      if (!timelineState.activeArrowItemIds.includes(id)) {
        timelineState.activeArrowItemIds.push(id)
      }
      await loadSubTechItems(id)
    }
  }

  const collapseAllSubItems = () => {
    const activeIds = [...timelineState.activeArrowItemIds]
    activeIds.forEach((id) => removeSubItems(id))
    timelineState.activeArrowItemIds = []
  }

  const focusItemById = async (itemId: string) => {
    await nextTick()
    if (!timelineInstance) return
    timelineInstance.setSelection([itemId])
    timelineInstance.focus(itemId, { animation: true })
  }

  const onContainerClick = async (event: MouseEvent) => {
    const target = event.target as HTMLElement

    const groupCheck = target.closest('.vis-group-check') as HTMLInputElement | null
    if (groupCheck) {
      event.stopPropagation()
      const groupId = groupCheck.dataset.id
      if (!groupId) return
      toggleGroupVisibility(groupId, groupCheck.checked)
      return
    }

    const addButton = target.closest('.vis-item-add') as HTMLElement | null

    if (addButton) {
      event.stopPropagation()
      const itemId = addButton.dataset.id
      if (!itemId) return

      const isVisible = !timelineState.activeArrowItemIds.includes(String(itemId))
      await visibleSubTechTree(isVisible, itemId)
      return
    }

    const itemContainer = target.closest('.vis-item-contents') as HTMLElement | null
    if (itemContainer) {
      const itemId = itemContainer.dataset.id
      if (!itemId) return
      const item = itemsDS.get(itemId)
      if (item) emit('open-detail-slide', item)
    }
  }

  const toggleAllGroups = (show: boolean) => {
    const allGroups = groupsDS.get({
      filter: (group: any) => !group.isOrganization,
    })

    if (!allGroups.length) return

    allGroups.forEach((group: any) => {
      toggleGroupVisibility(String(group.id), show)
    })
  }

  const setInstance = (instance: any) => {
    timelineInstance = instance
    ensureArrows()
  }

  const destroyTimelineArrows = () => {
    timelineArrows?.removeArrowAll()
    timelineArrows = null
  }

  return {
    itemsDS,
    groupsDS,
    timelineState,
    reloadData,
    onContainerClick,
    toggleAllGroups,
    toggleGroupVisibility,
    handleItemOver: loadSubTechItems,
    setInstance,
    expandAllSubItems,
    collapseAllSubItems,
    focusItemById,
    destroyTimelineArrows,
  }
}
