import { api } from '@/shared/api/axios'
import type { TimelineItem, TimelineProject, ProjectTask } from '../types'

export const fetchTimelineItems = (): Promise<TimelineItem[]> => api.get('/timeline')

/**
 * Mock API - 프로젝트 데이터 조회
 * 실제 프로덕션 환경에서는 실제 API 엔드포인트로 변경
 */
export const fetchTimelineProject = async (): Promise<TimelineProject> => {
  // 실제 API 호출 예시
  // return api.get('/projects/timeline')

  // Mock 데이터
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        groups: [
          {
            id: 1,
            name: 'Frontend Development',
            description: 'Vue.js and UI components',
            teamLead: 'Alice Johnson',
            memberCount: 5,
          },
          {
            id: 2,
            name: 'Backend Development',
            description: 'API and database',
            teamLead: 'Bob Smith',
            memberCount: 4,
          },
          {
            id: 3,
            name: 'QA & Testing',
            description: 'Quality assurance',
            teamLead: 'Carol Davis',
            memberCount: 3,
          },
        ],
        tasks: [
          // Frontend tasks
          {
            id: 1,
            groupId: 1,
            title: 'Design System Setup',
            description: 'Setup Vue components and design tokens',
            imageUrl:
              'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
            status: 'completed',
            priority: 'high',
            assignee: 'Alice Johnson',
            startDate: '2020-08-01',
            endDate: '2020-08-10',
            progress: 100,
            tags: ['Vue', 'Design', 'Setup'],
            details: {
              objectives: ['Create reusable components', 'Define design tokens', 'Setup Storybook'],
              deliverables: ['Component library', 'Design tokens file', 'Storybook setup'],
              resources: ['Vue 3 docs', 'Design tools', 'Team collaboration'],
            },
          },
          {
            id: 2,
            groupId: 1,
            title: 'Timeline Component Development',
            description: 'Build interactive timeline component with vis-timeline',
            imageUrl:
              'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Alice Johnson',
            startDate: '2020-08-15',
            endDate: '2020-08-30',
            progress: 75,
            tags: ['Vue', 'Timeline', 'vis-timeline'],
            details: {
              objectives: ['Implement timeline', 'Add interactions', 'Create examples'],
              deliverables: ['Timeline component', 'Example pages', 'Documentation'],
              resources: ['vis-timeline library', 'Design mockups'],
            },
          },
          {
            id: 3,
            groupId: 1,
            title: 'Forms & Validation',
            description: 'Build form components with validation',
            imageUrl:
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
            status: 'planning',
            priority: 'medium',
            assignee: 'Emma Wilson',
            startDate: '2020-09-01',
            endDate: '2020-09-15',
            progress: 20,
            tags: ['Vue', 'Forms', 'Validation'],
            details: {
              objectives: ['Create form components', 'Implement validation', 'Add error handling'],
              deliverables: ['Form components', 'Validation rules', 'Error messages'],
              resources: ['Vuelidate library', 'Design specs'],
            },
          },
          // Backend tasks
          {
            id: 4,
            groupId: 2,
            title: 'Database Schema Design',
            description: 'Design and implement database schema',
            imageUrl:
              'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=400&h=300&fit=crop',
            status: 'completed',
            priority: 'critical',
            assignee: 'Bob Smith',
            startDate: '2020-08-01',
            endDate: '2020-08-08',
            progress: 100,
            tags: ['Database', 'PostgreSQL', 'Schema'],
            details: {
              objectives: ['Design tables', 'Setup relationships', 'Create indexes'],
              deliverables: ['Schema SQL', 'Migration scripts', 'Documentation'],
              resources: ['PostgreSQL docs', 'Database tools'],
            },
          },
          {
            id: 5,
            groupId: 2,
            title: 'REST API Development',
            description: 'Build REST API endpoints',
            imageUrl:
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
            status: 'in-progress',
            priority: 'critical',
            assignee: 'Bob Smith',
            startDate: '2020-08-10',
            endDate: '2020-08-28',
            progress: 65,
            tags: ['API', 'REST', 'Node.js'],
            details: {
              objectives: ['Create API routes', 'Add authentication', 'Implement validation'],
              deliverables: ['API endpoints', 'Authentication system', 'API documentation'],
              resources: ['Express.js', 'JWT', 'API testing tools'],
            },
          },
          {
            id: 6,
            groupId: 2,
            title: 'Authentication & Authorization',
            description: 'Implement security and access control',
            imageUrl:
              'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop',
            status: 'planning',
            priority: 'critical',
            assignee: 'Charlie Brown',
            startDate: '2020-08-25',
            endDate: '2020-09-10',
            progress: 10,
            tags: ['Security', 'Authentication', 'JWT'],
            details: {
              objectives: ['Setup JWT', 'Create roles', 'Add permissions'],
              deliverables: ['Auth middleware', 'Role system', 'Security documentation'],
              resources: ['JWT library', 'Security best practices'],
            },
          },
          // QA tasks
          {
            id: 7,
            groupId: 3,
            title: 'Test Plan Development',
            description: 'Create comprehensive test plan',
            imageUrl:
              'https://images.unsplash.com/photo-1516534775068-bb23a28b5c38?w=400&h=300&fit=crop',
            status: 'completed',
            priority: 'high',
            assignee: 'Carol Davis',
            startDate: '2020-08-01',
            endDate: '2020-08-12',
            progress: 100,
            tags: ['QA', 'Testing', 'Documentation'],
            details: {
              objectives: ['Define test cases', 'Setup test environment', 'Create test data'],
              deliverables: ['Test plan document', 'Test cases', 'Test data'],
              resources: ['Test management tools', 'Team collaboration'],
            },
          },
          {
            id: 8,
            groupId: 3,
            title: 'Unit & Integration Testing',
            description: 'Write and execute unit and integration tests',
            imageUrl:
              'https://images.unsplash.com/photo-1516534775068-bb23a28b5c38?w=400&h=300&fit=crop',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Carol Davis',
            startDate: '2020-08-15',
            endDate: '2020-09-05',
            progress: 55,
            tags: ['Testing', 'Jest', 'Vitest'],
            details: {
              objectives: ['Write unit tests', 'Create integration tests', 'Achieve 80% coverage'],
              deliverables: ['Test files', 'Coverage reports', 'Test documentation'],
              resources: ['Jest/Vitest', 'Testing libraries'],
            },
          },
          {
            id: 9,
            groupId: 3,
            title: 'User Acceptance Testing',
            description: 'Conduct UAT with stakeholders',
            imageUrl:
              'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
            status: 'on-hold',
            priority: 'medium',
            assignee: 'Diana Martinez',
            startDate: '2020-09-10',
            endDate: '2020-09-20',
            progress: 0,
            tags: ['QA', 'UAT', 'Stakeholders'],
            details: {
              objectives: ['Validate requirements', 'Gather feedback', 'Log issues'],
              deliverables: ['UAT report', 'Issues list', 'Sign-off document'],
              resources: ['Stakeholder input', 'Issue tracking'],
            },
          },
        ],
      })
    }, 500)
  })
}

/**
 * Fetch a specific task details
 */
export const fetchTaskDetails = async (taskId: number): Promise<ProjectTask | null> => {
  const project = await fetchTimelineProject()
  return project.tasks.find((task) => task.id === taskId) || null
}
