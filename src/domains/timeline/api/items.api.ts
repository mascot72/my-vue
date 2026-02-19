import type { ItemCard } from '../types/item.types'

/**
 * Items API
 * 실제 환경에서는 실제 API 엔드포인트로 교체 필요
 */

// Mock 데이터 - 각 그룹별 아이템들
const mockItemsData: Record<string, ItemCard[]> = {
  '1-1-1-1': [ // Component Library
    {
      id: 'item-1',
      title: 'Button Component',
      description: 'Reusable button component with multiple variants and sizes',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['component', 'ui', 'vue'],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-01T14:30:00Z',
      metadata: {
        author: 'Alice Johnson',
        version: '1.2.0',
        downloads: 15420,
      },
    },
    {
      id: 'item-2',
      title: 'Input Field Component',
      description: 'Form input component with validation and error handling',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['component', 'form', 'validation'],
      createdAt: '2026-01-20T09:15:00Z',
      updatedAt: '2026-02-10T11:20:00Z',
      metadata: {
        author: 'Bob Smith',
        version: '2.0.0',
        downloads: 12350,
      },
    },
    {
      id: 'item-3',
      title: 'Modal Component',
      description: 'Accessible modal dialog with customizable content and actions',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'medium',
      tags: ['component', 'dialog', 'overlay'],
      createdAt: '2026-02-01T13:45:00Z',
      updatedAt: '2026-02-15T16:00:00Z',
      metadata: {
        author: 'Carol Davis',
        version: '1.0.0-beta',
        downloads: 8200,
      },
    },
  ],
  '1-1-1-2': [ // State Management
    {
      id: 'item-4',
      title: 'Pinia Store Setup',
      description: 'Global state management configuration and best practices',
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['pinia', 'state', 'store'],
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-25T10:30:00Z',
      metadata: {
        author: 'David Lee',
        version: '3.1.0',
        downloads: 25600,
      },
    },
    {
      id: 'item-5',
      title: 'Composable Helpers',
      description: 'Reusable composables for common state patterns',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['composables', 'helpers', 'utils'],
      createdAt: '2026-01-18T11:30:00Z',
      updatedAt: '2026-02-12T09:45:00Z',
      metadata: {
        author: 'Emma Wilson',
        version: '2.3.0',
        downloads: 18900,
      },
    },
  ],
  '1-1-2-1': [ // Hooks Library
    {
      id: 'item-6',
      title: 'useAsync Hook',
      description: 'Custom hook for handling async operations with loading states',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['react', 'hooks', 'async'],
      createdAt: '2026-01-12T14:20:00Z',
      updatedAt: '2026-02-05T12:10:00Z',
      metadata: {
        author: 'Frank Miller',
        version: '1.5.0',
        downloads: 22100,
      },
    },
  ],
  '1-2-1-1': [ // REST API
    {
      id: 'item-7',
      title: 'User API Endpoints',
      description: 'RESTful API endpoints for user management',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['api', 'rest', 'users'],
      createdAt: '2026-01-08T09:00:00Z',
      updatedAt: '2026-02-18T15:30:00Z',
      metadata: {
        author: 'Grace Chen',
        version: '4.0.0',
        downloads: 35000,
      },
    },
    {
      id: 'item-8',
      title: 'Product API',
      description: 'Product catalog and inventory management endpoints',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['api', 'products', 'inventory'],
      createdAt: '2026-01-22T10:15:00Z',
      updatedAt: '2026-02-16T11:45:00Z',
      metadata: {
        author: 'Henry Park',
        version: '3.2.0',
        downloads: 28400,
      },
    },
  ],
}

/**
 * 특정 그룹의 아이템들 조회
 */
export const fetchItemsByGroupId = async (groupId: string): Promise<ItemCard[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const items = mockItemsData[groupId] || []
      resolve(items)
    }, 800)
  })
}

/**
 * 특정 아이템 상세 정보 조회
 */
export const fetchItemById = async (itemId: string): Promise<ItemCard | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allItems = Object.values(mockItemsData).flat()
      const item = allItems.find((item) => item.id === itemId)
      resolve(item || null)
    }, 300)
  })
}
