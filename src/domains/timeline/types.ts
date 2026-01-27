// Basic Timeline Item
export interface TimelineItem {
  id: number
  content: string
  start: string
  end?: string
  group?: number
  title?: string
  type?: string
  className?: string
}

// API Response Models
export interface ProjectGroup {
  id: number
  name: string
  description: string
  teamLead: string
  memberCount: number
}

export interface ProjectTask {
  id: number
  groupId: number
  title: string
  description: string
  imageUrl: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: string
  startDate: string
  endDate: string
  progress: number
  tags: string[]
  type?: 'box' | 'range' | 'point'
  details: {
    objectives: string[]
    deliverables: string[]
    resources: string[]
  }
}

export interface TimelineProject {
  groups: ProjectGroup[]
  tasks: ProjectTask[]
}

// Transformed for Timeline
export interface TransformedTimelineData {
  items: TimelineItem[]
  groups: Array<{ id: number; content: string; title?: string }>
}
