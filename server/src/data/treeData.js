// Tree Mock Data
export const treeData = [
  // Level 1
  { id: '1', name: 'Engineering', level: 1, hasChildren: true },
  { id: '2', name: 'Marketing', level: 1, hasChildren: true },
  { id: '3', name: 'Sales', level: 1, hasChildren: true },
  { id: '4', name: 'HR & Operations', level: 1, hasChildren: false },
  { id: '5', name: 'Finance', level: 1, hasChildren: false },

  // Level 2 - Engineering
  { id: '1-1', name: 'Frontend', level: 2, parentId: '1', hasChildren: true },
  { id: '1-2', name: 'Backend', level: 2, parentId: '1', hasChildren: true },
  { id: '1-3', name: 'DevOps', level: 2, parentId: '1', hasChildren: true },
  { id: '1-4', name: 'Mobile', level: 2, parentId: '1', hasChildren: false },
  { id: '1-5', name: 'QA', level: 2, parentId: '1', hasChildren: false },

  // Level 2 - Marketing
  { id: '2-1', name: 'Digital Marketing', level: 2, parentId: '2', hasChildren: true },
  { id: '2-2', name: 'Content', level: 2, parentId: '2', hasChildren: true },
  { id: '2-3', name: 'Brand Strategy', level: 2, parentId: '2', hasChildren: false },
  { id: '2-4', name: 'Events', level: 2, parentId: '2', hasChildren: false },

  // Level 2 - Sales
  { id: '3-1', name: 'Enterprise', level: 2, parentId: '3', hasChildren: true },
  { id: '3-2', name: 'SMB', level: 2, parentId: '3', hasChildren: true },
  { id: '3-3', name: 'Customer Success', level: 2, parentId: '3', hasChildren: false },

  // Level 3 - Frontend
  { id: '1-1-1', name: 'Vue Team', level: 3, parentId: '1-1', hasChildren: true },
  { id: '1-1-2', name: 'React Team', level: 3, parentId: '1-1', hasChildren: true },
  { id: '1-1-3', name: 'Design System', level: 3, parentId: '1-1', hasChildren: false },
  { id: '1-1-4', name: 'Performance', level: 3, parentId: '1-1', hasChildren: false },

  // Level 3 - Backend
  { id: '1-2-1', name: 'API Services', level: 3, parentId: '1-2', hasChildren: true },
  { id: '1-2-2', name: 'Database', level: 3, parentId: '1-2', hasChildren: true },
  { id: '1-2-3', name: 'Microservices', level: 3, parentId: '1-2', hasChildren: false },
  { id: '1-2-4', name: 'Security', level: 3, parentId: '1-2', hasChildren: false },

  // Level 3 - DevOps
  { id: '1-3-1', name: 'Infrastructure', level: 3, parentId: '1-3', hasChildren: true },
  { id: '1-3-2', name: 'CI/CD', level: 3, parentId: '1-3', hasChildren: true },
  { id: '1-3-3', name: 'Monitoring', level: 3, parentId: '1-3', hasChildren: false },

  // Level 3 - Digital Marketing
  { id: '2-1-1', name: 'SEO', level: 3, parentId: '2-1', hasChildren: false },
  { id: '2-1-2', name: 'SEM', level: 3, parentId: '2-1', hasChildren: false },
  { id: '2-1-3', name: 'Social Media', level: 3, parentId: '2-1', hasChildren: false },

  // Level 3 - Content
  { id: '2-2-1', name: 'Blog', level: 3, parentId: '2-2', hasChildren: false },
  { id: '2-2-2', name: 'Video', level: 3, parentId: '2-2', hasChildren: false },
  { id: '2-2-3', name: 'Documentation', level: 3, parentId: '2-2', hasChildren: false },

  // Level 3 - Enterprise
  { id: '3-1-1', name: 'Fortune 500', level: 3, parentId: '3-1', hasChildren: false },
  { id: '3-1-2', name: 'Mid-Market', level: 3, parentId: '3-1', hasChildren: false },

  // Level 3 - SMB
  { id: '3-2-1', name: 'Startups', level: 3, parentId: '3-2', hasChildren: false },
  { id: '3-2-2', name: 'Small Business', level: 3, parentId: '3-2', hasChildren: false },

  // Level 4 - Vue Team
  { id: '1-1-1-1', name: 'Component Library', level: 4, parentId: '1-1-1', hasChildren: false },
  { id: '1-1-1-2', name: 'State Management', level: 4, parentId: '1-1-1', hasChildren: false },
  { id: '1-1-1-3', name: 'Routing', level: 4, parentId: '1-1-1', hasChildren: false },

  // Level 4 - React Team
  { id: '1-1-2-1', name: 'Hooks Library', level: 4, parentId: '1-1-2', hasChildren: false },
  { id: '1-1-2-2', name: 'Context API', level: 4, parentId: '1-1-2', hasChildren: false },
  { id: '1-1-2-3', name: 'Server Components', level: 4, parentId: '1-1-2', hasChildren: false },

  // Level 4 - API Services
  { id: '1-2-1-1', name: 'REST API', level: 4, parentId: '1-2-1', hasChildren: false },
  { id: '1-2-1-2', name: 'GraphQL', level: 4, parentId: '1-2-1', hasChildren: false },
  { id: '1-2-1-3', name: 'WebSocket', level: 4, parentId: '1-2-1', hasChildren: false },

  // Level 4 - Database
  { id: '1-2-2-1', name: 'PostgreSQL', level: 4, parentId: '1-2-2', hasChildren: false },
  { id: '1-2-2-2', name: 'Redis', level: 4, parentId: '1-2-2', hasChildren: false },
  { id: '1-2-2-3', name: 'MongoDB', level: 4, parentId: '1-2-2', hasChildren: false },

  // Level 4 - Infrastructure
  { id: '1-3-1-1', name: 'AWS', level: 4, parentId: '1-3-1', hasChildren: false },
  { id: '1-3-1-2', name: 'Docker', level: 4, parentId: '1-3-1', hasChildren: false },
  { id: '1-3-1-3', name: 'Kubernetes', level: 4, parentId: '1-3-1', hasChildren: false },

  // Level 4 - CI/CD
  { id: '1-3-2-1', name: 'GitHub Actions', level: 4, parentId: '1-3-2', hasChildren: false },
  { id: '1-3-2-2', name: 'Jenkins', level: 4, parentId: '1-3-2', hasChildren: false },
  { id: '1-3-2-3', name: 'GitLab CI', level: 4, parentId: '1-3-2', hasChildren: false },
  { id: '1-3-2-4', name: 'CircleCI', level: 4, parentId: '1-3-2', hasChildren: false },
]

/**
 * 루트 노드 조회 (Level 1)
 */
export const getRootNodes = () => {
  return treeData.filter(node => node.level === 1)
}

/**
 * 특정 부모의 자식 노드 조회
 */
export const getChildNodes = (parentId) => {
  return treeData.filter(node => node.parentId === parentId)
}

/**
 * 특정 노드 정보 조회
 */
export const getNodeById = (nodeId) => {
  return treeData.find(node => node.id === nodeId) || null
}
