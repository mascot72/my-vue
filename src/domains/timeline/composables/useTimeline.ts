import { Timeline } from 'vis-timeline'
import type { TimelineItem } from '../types'

export function useTimeline(
  el: HTMLElement,
  items: TimelineItem[]
) {
  const timeline = new Timeline(el, items, {
    stack: false,
    zoomKey: 'ctrlKey',
  })

  return {
    setItems: (items: TimelineItem[]) => timeline.setItems(items),
    destroy: () => timeline.destroy(),
  }
}
