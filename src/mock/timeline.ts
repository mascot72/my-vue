import type { TimelineItem } from '../domains/timeline/types'

export const timelineMock: TimelineItem[] = [
  {
    id: 1,
    content: 'Task A',
    start: '2024-01-01',
  },
  {
    id: 2,
    content: 'Task B',
    start: '2024-01-03',
    end: '2024-01-05',
  },
]

import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/timeline',
    method: 'get',
    response: () => [
      { id: 1, content: 'Task A', start: '2024-01-01' },
      { id: 2, content: 'Task B', start: '2024-01-03' },
    ],
  },
] as MockMethod[]
