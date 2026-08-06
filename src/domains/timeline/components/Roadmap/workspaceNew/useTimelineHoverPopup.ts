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

  const movePopupPosition = (x: number, y: number) => {
    const width = 320
    const height = 220
    const gap = 12
    const maxLeft = window.innerWidth - width - 8
    const maxTop = window.innerHeight - height - 8

    popupPosition.left = Math.max(8, Math.min(x + gap, maxLeft))
    popupPosition.top = Math.max(8, Math.min(y + gap, maxTop))
  }

  const moveObjectPosition = (
    basePoint: TimelinePositionAnchor,
    objectRect: Pick<DOMRect, 'height' | 'width'>,
    verticalGapSize = 0,
  ) => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let top = basePoint.bottom + window.scrollY + verticalGapSize
    let left = basePoint.left + window.scrollX

    if (top + objectRect.height > window.scrollY + windowHeight) {
      top = basePoint.top + window.scrollY - objectRect.height - verticalGapSize
    }

    if (left + objectRect.width > window.scrollX + windowWidth) {
      left -= left + objectRect.width - (window.scrollX + windowWidth)
      if (left < 1) left = 1
    }

    return { top, left }
  }

  const getPopupElement = () => document.querySelector('.item-hover-popup') as HTMLElement | null

  const showPopupFromEvent = async (itemId: string | number, event: MouseEvent, pinned = false) => {
    const targetItem = getPopupItemById(itemId)
    if (!targetItem) return

    popupItem.value = targetItem
    popupState.show = true
    popupState.pinned = pinned
    await nextTick()

    const timeline = getTimeline() as TimelineLike | null
    const timelineItem = timeline?.itemSet?.items?.[String(itemId)]
    const popupEl = getPopupElement()

    if (timelineItem?.dom?.content && popupEl) {
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
    } else {
      movePopupPosition(event.pageX, event.pageY)
    }
  }

  const closePopup = (force = false) => {
    clearHidePopupTimer()
    if (!force && popupState.pinned) return

    popupState.show = false
    popupState.pinned = false
    popupItem.value = null
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
    attachGlobalListeners,
    detachGlobalListeners,
  }
}
