import { Timeline } from 'vis-timeline'
import type { TimelineItem } from '../types'
import type { TimelineGroup } from 'vis-timeline'

export function useTimeline(el: HTMLElement, items: TimelineItem[]) {
  const timeline = new Timeline(el, items, {
    stack: false,
    zoomKey: 'ctrlKey',
  })

  return {
    // 아이템 관리
    setItems: (items: TimelineItem[]) => timeline.setItems(items),
    setGroups: (groups: TimelineGroup[]) => timeline.setGroups(groups),

    // 선택 관리
    setSelection: (ids: (string | number)[]) => timeline.setSelection(ids),
    getSelection: () => timeline.getSelection(),

    // 포커스
    focus: (id: string | number) => timeline.focus(id),

    // 시간 범위 관리
    setWindow: (start: Date | number, end: Date | number) => timeline.setWindow(start, end),
    getWindow: () => timeline.getWindow(),
    moveTo: (time: Date | number, options?: { animation: boolean }) =>
      timeline.moveTo(time, options),

    // 줌 제어
    zoomIn: (percentage?: number) => timeline.zoomIn(percentage ?? 0.3),
    zoomOut: (percentage?: number) => timeline.zoomOut(percentage ?? 0.3),

    // 옵션 관리
    setOptions: (options: object) => timeline.setOptions(options),

    // 이벤트 리스너
    on: (event: string, callback: (properties?: unknown) => void) => timeline.on(event, callback),
    off: (event: string, callback?: (properties?: unknown) => void) =>
      timeline.off(event, callback),

    // 레이아웃 및 범위
    fit: () => timeline.fit(),
    getCurrentTime: () => timeline.getCurrentTime(),

    // 정리
    destroy: () => timeline.destroy(),
  }
}
