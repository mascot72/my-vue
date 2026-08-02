import moment from 'moment'
import { toRaw } from 'vue'

interface TimelineOptionConfig {
  itemMargin: number
  options?: Record<string, unknown>
  viewMode: 'MONTH' | 'QUARTER'
}

interface TimelineOptions {
  start: Date | string
  end: Date | string
  orientation: string
  horizontalScroll: boolean
  verticalScroll: boolean
  stack: boolean
  stackSubgroups: boolean
  zoomKey: string
  margin: { item: number }
  locale?: string
  order: (a: Record<string, unknown>, b: Record<string, unknown>) => number
  groupOrder: string
  format: {
    minorLabels: (date: Date, scale: string, step: number) => string
    majorLabels: (date: Date, scale: string, step: number) => string
  }
  showTooltips: boolean
  [key: string]: unknown
}

export default function useTimelineOption({ itemMargin, options, viewMode }: TimelineOptionConfig) {
  const oneDay = 1000 * 60 * 60 * 24
  const oneYear = oneDay * 365

  const monthOption = {
    zoomMin: oneYear * 1,
    zoomMax: oneYear * 4,
    timeAxis: { scale: 'month', step: 1 },
  }

  const quarterOption = {
    zoomMin: oneYear * 2,
    zoomMax: oneYear * 6,
    timeAxis: { scale: 'month', step: 3 },
  }

  const defaultOptions: TimelineOptions = {
    start: '2024-01-01',
    end: '2027-12-31',
    orientation: 'top',
    horizontalScroll: true,
    verticalScroll: true,
    stack: true,
    stackSubgroups: true,
    zoomKey: 'ctrlKey',
    margin: { item: itemMargin },
    // locale: 'ko',
    order: (a, b) => (a.order as number) - (b.order as number),
    groupOrder: 'order',
    format: {
      minorLabels: (date, scale, step) => {
        if (scale === 'year') return moment(date).format('YYYY년')
        if (scale === 'month') return step === 1 ? moment(date).format('M월') : `Q${moment(date).quarter()}`
        return moment(date).format('DD일')
      },
      majorLabels: (date) => moment(date).format('YYYY년'),
    },
    showTooltips: false,
    onInitialDrawComplete: () => {
      console.log('Timeline initial draw complete')
    },
    onUpdate: (item: Record<string, unknown>, callback: (item: Record<string, unknown>) => void) => {
      item.content = prompt('Edit items text:', item.content as string) || item.content
      callback(item)
    },
  }

  const makeTimelineOptions = (viewType: 'MONTH' | 'QUARTER') => {
    const targetOption = viewType === 'MONTH' ? monthOption : quarterOption
    const currentOptions = toRaw({
      ...defaultOptions,
      ...options,
      ...targetOption,
    }) as TimelineOptions

    const centerDate = new Date()
    const range = viewMode === 'MONTH' ? oneYear * 2 : oneYear * 3
    currentOptions.start = new Date(centerDate.getTime() - range)
    currentOptions.end = new Date(centerDate.getTime() + range)
    return currentOptions
  }

  return { makeTimelineOptions }
}
