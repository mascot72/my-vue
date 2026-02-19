import { Timeline } from 'vis-timeline'
import type { TimelineItem } from '../types'
import type { TimelineGroup } from 'vis-timeline'

export function useTimeline(el: HTMLElement, items: TimelineItem[]) {
  // 현재 날짜 기준 6개월 범위 설정
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
  
  const timeline = new Timeline(el, items, {
    stack: true,
    zoomKey: 'ctrlKey',
    start: sixMonthsAgo,
    end: sixMonthsLater,
    min: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    max: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
    // 시간축 설정
    orientation: 'top',
    showCurrentTime: true,
    showMajorLabels: true,
    showMinorLabels: true,
    // 격자 설정
    timeAxis: { scale: 'week', step: 1 },
    format: {
      minorLabels: {
        week: 'w주',
        day: 'D',
      },
      majorLabels: {
        month: 'YYYY년 M월',
        week: 'YYYY년 M월',
        day: 'YYYY년 M월',
      },
    },
    // 아이템 높이 설정 (카드 형태)
    margin: {
      item: {
        horizontal: 8,
        vertical: 8,
      },
    },
    // HTML 템플릿 렌더링
    template: (item: any) => {
      const div = document.createElement('div')
      div.innerHTML = item.content
      return (div.firstElementChild as HTMLElement) || div
    },
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
