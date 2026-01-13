import { api } from '@/shared/api/axios'
import type { TimelineItem } from '../types'

export const fetchTimelineItems = (): Promise<TimelineItem[]> =>
  api.get('/timeline')
