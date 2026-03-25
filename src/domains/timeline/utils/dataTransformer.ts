import type { ProjectTask, ProjectGroup, TimelineItem, TransformedTimelineData } from '../types'
import type { TreeNodeData } from '../types/tree.types'
import type { ItemCard } from '../types/item.types'

/**
 * Status별 색상 및 우선순위 스타일 정의
 */
const STATUS_CONFIG = {
  planning: { color: '#f59e0b', label: 'Planning' },
  'in-progress': { color: '#3b82f6', label: 'In Progress' },
  completed: { color: '#10b981', label: 'Completed' },
  'on-hold': { color: '#ef4444', label: 'On Hold' },
}

const PRIORITY_CONFIG = {
  low: { emoji: '🟢', label: 'Low' },
  medium: { emoji: '🟡', label: 'Medium' },
  high: { emoji: '🟠', label: 'High' },
  critical: { emoji: '🔴', label: 'Critical' },
}

/**
 * ProjectTask를 TimelineItem으로 변환
 * HTML content로 이미지와 상세 정보 포함
 */
export const transformTaskToTimelineItem = (task: ProjectTask): TimelineItem => {
  const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]

  // HTML 콘텐츠 생성
  const htmlContent = `
    <div style="padding: 8px;">
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <img
          src="${task.imageUrl}"
          alt="${task.title}"
          style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover; flex-shrink: 0;"
        />
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px; word-break: break-word;">
            ${task.title}
          </div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px; line-height: 1.3;">
            ${task.description}
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 11px;">
            <span style="background: ${statusConfig.color}; color: white; padding: 2px 6px; border-radius: 3px;">
              ${statusConfig.label}
            </span>
            <span>${priorityConfig.emoji} ${priorityConfig.label}</span>
            <span style="color: #999;">👤 ${task.assignee}</span>
          </div>
          <div style="margin-top: 4px; background: #f0f0f0; border-radius: 2px; height: 4px; overflow: hidden;">
            <div style="background: ${statusConfig.color}; height: 100%; width: ${task.progress}%;"></div>
          </div>
        </div>
      </div>
    </div>
  `

  return {
    id: task.id,
    group: task.groupId,
    content: htmlContent,
    start: task.startDate,
    end: task.endDate,
    title: `${task.title}\n${task.description}\n\nAssignee: ${task.assignee}\nProgress: ${task.progress}%`,
    type: task.type || undefined,
    className: `status-${task.status} priority-${task.priority}`,
  }
}

/**
 * ProjectGroup를 Timeline Group으로 변환
 */
export const transformGroupToTimelineGroup = (group: ProjectGroup) => {
  return {
    id: group.id,
    content: `<div style="font-weight: 500;">${group.name}</div>`,
    title: `${group.name}\n${group.description}\nTeam Lead: ${group.teamLead}\nMembers: ${group.memberCount}`,
  }
}

/**
 * 전체 프로젝트 데이터를 Timeline 포맷으로 변환
 */
export const transformProjectToTimeline = (
  groups: ProjectGroup[],
  tasks: ProjectTask[],
): TransformedTimelineData => {
  return {
    items: tasks.map(transformTaskToTimelineItem),
    groups: groups.map(transformGroupToTimelineGroup),
  }
}

/**
 * 상세 정보 HTML 생성
 */
export const generateTaskDetailHtml = (task: ProjectTask): string => {
  const statusConfig = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]
  const priorityConfig = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]

  const tagsHtml = task.tags
    .map(
      (tag) =>
        `<span style="background: #e5e7eb; padding: 4px 8px; border-radius: 3px; font-size: 11px; margin-right: 4px;">${tag}</span>`,
    )
    .join('')

  const objectivesHtml = task.details.objectives
    .map((obj) => `<li style="margin: 4px 0; font-size: 12px;">${obj}</li>`)
    .join('')

  const deliverablesHtml = task.details.deliverables
    .map((del) => `<li style="margin: 4px 0; font-size: 12px;">${del}</li>`)
    .join('')

  const resourcesHtml = task.details.resources
    .map((res) => `<li style="margin: 4px 0; font-size: 12px;">${res}</li>`)
    .join('')

  return `
    <div style="padding: 16px; background: white; border-radius: 8px; max-width: 500px;">
      <!-- Header with image -->
      <div style="margin-bottom: 16px;">
        <img
          src="${task.imageUrl}"
          alt="${task.title}"
          style="width: 100%; height: 250px; border-radius: 6px; object-fit: cover; margin-bottom: 12px;"
        />
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">${task.title}</h2>
        <p style="margin: 0; color: #666; font-size: 14px;">${task.description}</p>
      </div>

      <!-- Status and Priority -->
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div>
          <span style="color: #999; font-size: 12px;">Status</span>
          <div style="background: ${statusConfig.color}; color: white; padding: 6px 12px; border-radius: 4px; margin-top: 2px;">
            ${statusConfig.label}
          </div>
        </div>
        <div>
          <span style="color: #999; font-size: 12px;">Priority</span>
          <div style="padding: 6px 12px; border-radius: 4px; background: #f0f0f0; margin-top: 2px;">
            ${priorityConfig.emoji} ${priorityConfig.label}
          </div>
        </div>
        <div>
          <span style="color: #999; font-size: 12px;">Progress</span>
          <div style="margin-top: 2px;">
            <div style="width: 100px; background: #e5e7eb; border-radius: 3px; height: 6px; overflow: hidden;">
              <div style="background: ${statusConfig.color}; height: 100%; width: ${task.progress}%;"></div>
            </div>
            <span style="font-size: 12px; font-weight: 500;">${task.progress}%</span>
          </div>
        </div>
      </div>

      <!-- Team Info -->
      <div style="background: #f9fafb; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <div style="display: flex; gap: 16px; font-size: 13px;">
          <div>
            <span style="color: #999;">Assignee</span><br/>
            <strong>${task.assignee}</strong>
          </div>
          <div>
            <span style="color: #999;">Timeline</span><br/>
            <strong>${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>

      <!-- Tags -->
      ${task.tags.length > 0 ? `<div style="margin-bottom: 16px;">${tagsHtml}</div>` : ''}

      <!-- Details sections -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">Objectives</h3>
          <ul style="margin: 0; padding-left: 16px;">${objectivesHtml}</ul>
        </div>
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">Deliverables</h3>
          <ul style="margin: 0; padding-left: 16px;">${deliverablesHtml}</ul>
        </div>
      </div>

      <div style="margin-top: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">Resources</h3>
        <ul style="margin: 0; padding-left: 16px;">${resourcesHtml}</ul>
      </div>
    </div>
  `
}

const normalizeStatus = (status: ItemCard['status']): ProjectTask['status'] => {
  if (status === 'active') return 'in-progress'
  if (status === 'pending') return 'planning'
  if (status === 'archived') return 'on-hold'
  return 'completed'
}

const normalizeAssignee = (item: ItemCard): string => {
  const author = item.metadata?.author
  return typeof author === 'string' && author.trim().length > 0 ? author : 'Unknown'
}

const normalizeProgress = (status: ItemCard['status']): number => {
  if (status === 'completed') return 100
  if (status === 'active') return 60
  if (status === 'pending') return 20
  return 0
}

const toProjectTask = (item: ItemCard): ProjectTask => ({
  id: item.id,
  groupId: item.groupId,
  title: item.title,
  description: item.description,
  imageUrl: item.imageUrl || '',
  status: normalizeStatus(item.status),
  priority: item.priority,
  assignee: normalizeAssignee(item),
  startDate: item.start,
  endDate: item.end,
  progress: normalizeProgress(item.status),
  tags: item.tags,
  details: {
    objectives: [item.description],
    deliverables: [item.title],
    resources: [`updated: ${item.updatedAt}`],
  },
})

export const transformBackendProjectToTimeline = (
  groups: TreeNodeData[],
  tasks: ItemCard[],
): TransformedTimelineData => {
  const childrenByParent = new Map<string, string[]>()
  groups.forEach((group) => {
    if (!group.parentId) return
    const existing = childrenByParent.get(group.parentId) ?? []
    existing.push(group.id)
    childrenByParent.set(group.parentId, existing)
  })

  const mappedGroups = groups.map((group) => ({
    id: group.id,
    content: `<div style="font-weight: 600;">${group.name}</div>`,
    title: `${group.name}\nLevel: ${group.level}`,
    parent: group.parentId,
    treeLevel: group.level,
    nestedGroups: childrenByParent.get(group.id) ?? [],
    showNested: true,
    order: group.id,
  }))

  const mappedItems = tasks.map((task) => transformTaskToTimelineItem(toProjectTask(task)))

  return {
    groups: mappedGroups,
    items: mappedItems,
  }
}

export const transformBackendItemToTaskDetailHtml = (item: ItemCard): string => {
  const projectTask = toProjectTask(item)
  return generateTaskDetailHtml(projectTask)
}
