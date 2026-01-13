import { defineStore } from 'pinia'
import type { TimelineItem } from '../types'
import { fetchTimelineItems } from '../api/timeline.api'

export const useTimelineStore = defineStore('timeline', {
  state: () => ({
    items: [] as TimelineItem[],
    loading: false,
  }),

  actions: {
    async load() {
      this.loading = true
      this.items = await fetchTimelineItems()
      this.loading = false
    },
  },
})
