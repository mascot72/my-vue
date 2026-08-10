import { reactive, ref, nextTick } from 'vue'

type TimelineRecord = Record<string, unknown>
type TimelinePositionAnchor = { top: number; bottom: number; left: number }
type TimelineVisualItem = { dom?: { content?: HTMLElement } }
type TimelineLike = { itemSet?: { items?: Record<string, TimelineVisualItem> } }
type PopupItem = {
  id?: string | number
  title?: string
  titleEn?: string
  organizationNm?: string
  itemStatusName?: string
  itemStatusCode?: string
  technologyClassLv3Name?: string
  ptrmType?: string
}

type TimelineClickEvent = { what?: string; item?: string | number; event: MouseEvent }
type TimelineHoverEvent = { item?: string | number; event: MouseEvent }

interface UseTimelineHoverPopupParams {
  itemsDS: { get: (id: string) => PopupItem | null }
  getAllItems: () => TimelineRecord[]
  useItemTooltip: () => boolean
  getTimeline: () => unknown
  getTimelineContainer: () => HTMLElement | null
  itemMargin?: number
  onOpenDetail: (item: PopupItem) => void
}

export const useTimelineHoverPopup = ({
  itemsDS,
  getAllItems,
  useItemTooltip,
  getTimeline,
  getTimelineContainer,
  itemMargin = 3,
  onOpenDetail,
}: UseTimelineHoverPopupParams) => {
  const popupState = reactive({
    show: false,
    pinned: false,
    hoveringPopup: false,
  })
  const popupItem = ref<PopupItem | null>(null)
  const popupPosition = reactive({ top: 0, left: 0 })
  const activeItemId = ref<string | number | null>(null)
  const lastPointer = reactive({ x: 0, y: 0 })

  let hidePopupTimer: ReturnType<typeof setTimeout> | null = null

  const clearHidePopupTimer = () => {
    if (!hidePopupTimer) return
    clearTimeout(hidePopupTimer)
    hidePopupTimer = null
  }

  const getPopupItemById = (itemId: string | number) => {
    const dsItem = itemsDS.get(String(itemId))
    if (dsItem) return dsItem

    const allItems = getAllItems()
    return allItems.find((item) => String(item.id) === String(itemId)) as PopupItem | undefined
  }

  const getContainerBounds = () => {
    const container = getTimelineContainer()
    if (!container) return null
    return container.getBoundingClientRect()
  }

  const clampToBounds = (
    left: number,
    top: number,
    popupWidth: number,
    popupHeight: number,
  ) => {
    const containerRect = getContainerBounds()
    const viewportMinLeft = 8
    const viewportMinTop = 8
    const viewportMaxLeft = window.innerWidth - popupWidth - 8
    const viewportMaxTop = window.innerHeight - popupHeight - 8

    const minLeft = containerRect
      ? Math.max(viewportMinLeft, containerRect.left + 8)
      : viewportMinLeft
    const maxLeft = containerRect
      ? Math.min(viewportMaxLeft, containerRect.right - popupWidth - 8)
      : viewportMaxLeft

    const minTop = containerRect
      ? Math.max(viewportMinTop, containerRect.top + 8)
      : viewportMinTop
    const maxTop = containerRect
      ? Math.min(viewportMaxTop, containerRect.bottom - popupHeight - 8)
      : viewportMaxTop

    const clampedLeft = maxLeft < minLeft ? minLeft : Math.max(minLeft, Math.min(left, maxLeft))
    const clampedTop = maxTop < minTop ? minTop : Math.max(minTop, Math.min(top, maxTop))

    return { left: clampedLeft, top: clampedTop }
  }

  const movePopupPosition = (x: number, y: number, popupWidth = 320, popupHeight = 220) => {
    const gap = 12
    const next = clampToBounds(x + gap, y + gap, popupWidth, popupHeight)
    popupPosition.left = next.left
    popupPosition.top = next.top
  }

  const moveObjectPosition = (
    basePoint: TimelinePositionAnchor,
    objectRect: Pick<DOMRect, 'height' | 'width'>,
    verticalGapSize = 0,
  ) => {
    let top = basePoint.bottom + verticalGapSize
    const left = basePoint.left

    if (top + objectRect.height > window.innerHeight) {
      top = basePoint.top - objectRect.height - verticalGapSize
    }

    return clampToBounds(left, top, objectRect.width, objectRect.height)
  }

  const getPopupElement = () => document.querySelector('.item-hover-popup') as HTMLElement | null

  const getEventClientPoint = (event: MouseEvent) => {
    const x = Number.isFinite(event.clientX)
      ? event.clientX
      : Number.isFinite(event.pageX)
        ? event.pageX - window.scrollX
        : lastPointer.x

    const y = Number.isFinite(event.clientY)
      ? event.clientY
      : Number.isFinite(event.pageY)
        ? event.pageY - window.scrollY
        : lastPointer.y

    return { x, y }
  }

  const placePopupNearItem = (itemId: string | number) => {
    const timeline = getTimeline() as TimelineLike | null
    const timelineItem = timeline?.itemSet?.items?.[String(itemId)]
    const popupEl = getPopupElement()

    if (!timelineItem?.dom?.content || !popupEl) return false

    const itemRect = timelineItem.dom.content.getBoundingClientRect()
    const anchor: TimelinePositionAnchor = {
      top: itemRect.top,
      bottom: itemRect.bottom,
      left: itemRect.left,
    }

    const centerPanel = getTimelineContainer()?.querySelector('.vis-panel.vis-center')
    if (centerPanel) {
      const centerRect = centerPanel.getBoundingClientRect()
      if (anchor.left < centerRect.left) {
        anchor.left = centerRect.left
      }
    }

    const popupRect = popupEl.getBoundingClientRect()
    const position = moveObjectPosition(anchor, popupRect, itemMargin)
    popupPosition.top = position.top
    popupPosition.left = position.left
    return true
  }

  const showPopupFromEvent = async (itemId: string | number, event: MouseEvent, pinned = false) => {
    const targetItem = getPopupItemById(itemId)
    if (!targetItem) return

    const pointer = getEventClientPoint(event)
    lastPointer.x = pointer.x
    lastPointer.y = pointer.y

    popupItem.value = targetItem
    activeItemId.value = itemId
    popupState.show = true
    popupState.pinned = pinned
    await nextTick()

    if (!placePopupNearItem(itemId)) {
      movePopupPosition(pointer.x, pointer.y)
    }
  }

  const handleTimelineViewportChange = () => {
    if (!popupState.show || !activeItemId.value) return

    if (!placePopupNearItem(activeItemId.value)) {
      movePopupPosition(lastPointer.x, lastPointer.y)
    }
  }

  const closePopup = (force = false) => {
    clearHidePopupTimer()
    if (!force && popupState.pinned) return

    popupState.show = false
    popupState.pinned = false
    popupItem.value = null
    activeItemId.value = null
  }

  const onPopupEnter = () => {
    popupState.hoveringPopup = true
    clearHidePopupTimer()
  }

  const onPopupLeave = () => {
    popupState.hoveringPopup = false
    if (popupState.pinned) return
    closePopup(false)
  }

  const onOpenDetailFromPopup = (item: PopupItem) => {
    onOpenDetail(item)
  }

  const handleTimelineItemOver = (eventProps: TimelineHoverEvent) => {
    if (!useItemTooltip()) return
    if (popupState.pinned) return
    if (!eventProps.item) return

    clearHidePopupTimer()
    showPopupFromEvent(eventProps.item, eventProps.event, false)
  }

  const handleTimelineItemOut = () => {
    if (popupState.pinned) return

    clearHidePopupTimer()
    hidePopupTimer = setTimeout(() => {
      if (!popupState.hoveringPopup) {
        closePopup(false)
      }
    }, 100)
  }

  const handleTimelineClick = (eventProps: TimelineClickEvent) => {
    if (eventProps.what !== 'item' || !eventProps.item) {
      closePopup(true)
      return
    }

    showPopupFromEvent(eventProps.item, eventProps.event, true)
  }

  const handleWindowMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.closest('.item-hover-popup')) return
    if (target.closest('.vis-item')) return
    closePopup(true)
  }

  const handleWindowKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePopup(true)
    }
  }

  const attachGlobalListeners = () => {
    window.addEventListener('mousedown', handleWindowMouseDown)
    window.addEventListener('keydown', handleWindowKeyDown)
  }

  const detachGlobalListeners = () => {
    window.removeEventListener('mousedown', handleWindowMouseDown)
    window.removeEventListener('keydown', handleWindowKeyDown)
    clearHidePopupTimer()
  }

  return {
    popupState,
    popupItem,
    popupPosition,
    closePopup,
    onPopupEnter,
    onPopupLeave,
    onOpenDetailFromPopup,
    handleTimelineItemOver,
    handleTimelineItemOut,
    handleTimelineClick,
    handleTimelineViewportChange,
    attachGlobalListeners,
    detachGlobalListeners,
  }
}
