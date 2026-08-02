// Items Mock Data
// Note: This is a simplified version. For full data, copy from the original items.api.ts file

export const itemsData = {
  // Level 1 Leaf Nodes
  '4': [ // HR & Operations
    {
      id: 'item-hr-1',
      title: 'Employee Onboarding System',
      description: 'Streamlined onboarding process for new employees with digital workflows',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['hr', 'onboarding', 'workflow'],
      start: '2024-01-05T09:00:00Z',
      end: '2025-03-15T17:00:00Z',
      createdAt: '2026-01-05T09:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
      metadata: {
        author: 'Jennifer Kim',
        version: '2.1.0',
        downloads: 8500,
      },
      groupId: '4'
    },
    {
      id: 'item-hr-2',
      title: 'Performance Review Platform',
      description: 'Annual and quarterly performance review management system',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'medium',
      tags: ['hr', 'performance', 'review'],
      start: '2025-12-01T11:30:00Z',
      end: '2026-02-10T14:20:00Z',
      createdAt: '2026-01-10T11:30:00Z',
      updatedAt: '2026-02-10T14:20:00Z',
      metadata: {
        author: 'Michael Brown',
        version: '1.8.0',
        downloads: 6200,
      },
      groupId: '4'
    },
  ],
  '5': [ // Finance
    {
      id: 'item-finance-1',
      title: 'Expense Management Tool',
      description: 'Track and approve company expenses with automated workflows',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['finance', 'expense', 'automation'],
      start: '2025-01-08T08:30:00Z',
      end: '2026-04-30T18:00:00Z',
      createdAt: '2026-01-08T08:30:00Z',
      updatedAt: '2026-02-18T16:45:00Z',
      metadata: {
        author: 'Sarah Williams',
        version: '3.2.0',
        downloads: 12800,
      },
      groupId: '5'
    },
    {
      id: 'item-finance-2',
      title: 'Budget Forecasting Dashboard',
      description: 'Real-time budget tracking and forecasting with AI insights',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'high',
      tags: ['finance', 'budget', 'analytics'],
      start: '2024-02-01T10:00:00Z',
      end: '2026-03-20T17:00:00Z',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-16T11:30:00Z',
      metadata: {
        author: 'James Anderson',
        version: '2.0.0-beta',
        downloads: 4500,
      },
      groupId: '5'
    },
  ],

  // Level 2 Leaf Nodes
  '1-4': [ // Mobile
    {
      id: 'item-mobile-1',
      title: 'iOS App Development',
      description: 'Native iOS application with Swift and SwiftUI',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['ios', 'swift', 'mobile'],
      start: '2023-12-15T09:00:00Z',
      end: '2024-03-30T17:00:00Z',
      createdAt: '2026-01-12T09:00:00Z',
      updatedAt: '2026-02-14T15:30:00Z',
      metadata: {
        author: 'Kevin Lee',
        version: '1.5.0',
        downloads: 18900,
      },
      groupId: '1-4'
    },
    {
      id: 'item-mobile-2',
      title: 'Android App Development',
      description: 'Native Android application with Kotlin and Jetpack Compose',
      imageUrl: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['android', 'kotlin', 'mobile'],
      start: '2025-11-20T09:00:00Z',
      end: '2026-04-15T17:00:00Z',
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-02-13T14:00:00Z',
      metadata: {
        author: 'Lisa Chen',
        version: '1.4.0',
        downloads: 17200,
      },
      groupId: '1-4'
    },
  ],
  '1-5': [ // QA
    {
      id: 'item-qa-1',
      title: 'Automated Testing Framework',
      description: 'End-to-end testing automation with Cypress and Playwright',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['testing', 'automation', 'qa'],
      start: '2025-12-10T08:00:00Z',
      end: '2026-02-08T12:00:00Z',
      createdAt: '2023-01-05T08:00:00Z',
      updatedAt: '2023-02-08T12:00:00Z',
      metadata: {
        author: 'Ryan Martinez',
        version: '2.3.0',
        downloads: 21500,
      },
      groupId: '1-5'
    },
    {
      id: 'item-qa-2',
      title: 'Performance Testing Suite',
      description: 'Load and stress testing tools for application performance',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['performance', 'testing', 'qa'],
      start: '2022-01-10T09:00:00Z',
      end: '2024-03-25T16:00:00Z',
      createdAt: '2026-01-18T09:30:00Z',
      updatedAt: '2026-02-12T16:00:00Z',
      metadata: {
        author: 'Emily Davis',
        version: '1.7.0',
        downloads: 14600,
      },
      groupId: '1-5'
    },
  ],
  '2-3': [ // Brand Strategy
    {
      id: 'item-brand-1',
      title: 'Brand Guidelines',
      description: 'Comprehensive brand identity and usage guidelines',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'medium',
      tags: ['brand', 'design', 'guidelines'],
      start: '2025-11-15T09:00:00Z',
      end: '2026-02-01T11:00:00Z',
      createdAt: '2026-01-03T10:00:00Z',
      updatedAt: '2026-02-01T11:00:00Z',
      metadata: {
        author: 'Olivia Taylor',
        version: '3.0.0',
        downloads: 9800,
      },
      groupId: '2-3'
    },
  ],
  '2-4': [ // Events
    {
      id: 'item-events-1',
      title: 'Conference Planning',
      description: 'Annual tech conference planning and execution',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'high',
      tags: ['events', 'conference', 'marketing'],
      start: '2023-02-01T09:00:00Z',
      end: '2026-05-20T18:00:00Z',
      createdAt: '2026-02-05T09:00:00Z',
      updatedAt: '2026-02-17T10:30:00Z',
      metadata: {
        author: 'Daniel White',
        version: '1.0.0',
        downloads: 3200,
      },
      groupId: '2-4'
    },
  ],
  '3-3': [ // Customer Success
    {
      id: 'item-cs-1',
      title: 'Customer Support Platform',
      description: 'Integrated customer support and ticketing system',
      imageUrl: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['support', 'customer', 'service'],
      start: '2023-12-05T08:00:00Z',
      end: '2026-05-15T17:00:00Z',
      createdAt: '2026-01-06T08:30:00Z',
      updatedAt: '2026-02-16T15:00:00Z',
      metadata: {
        author: 'Sophia Garcia',
        version: '2.5.0',
        downloads: 19800,
      },
      groupId: '3-3'
    },
    {
      id: 'item-cs-2',
      title: 'Customer Health Scoring',
      description: 'AI-powered customer health monitoring and alerts',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['analytics', 'customer', 'ai'],
      start: '2026-01-15T10:00:00Z',
      end: '2026-03-10T14:00:00Z',
      createdAt: '2026-01-20T11:00:00Z',
      updatedAt: '2026-02-14T13:30:00Z',
      metadata: {
        author: 'William Johnson',
        version: '1.3.0',
        downloads: 11200,
      },
      groupId: '3-3'
    },
  ],

  // Level 3 Leaf Nodes
  '1-1-3': [ // Design System
    {
      id: 'item-design-1',
      title: 'Component Design Tokens',
      description: 'Centralized design tokens for consistent theming',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['design', 'tokens', 'theme'],
      start: '2025-05-01T09:00:00Z',
      end: '2026-02-10T12:00:00Z',
      createdAt: '2026-01-07T09:00:00Z',
      updatedAt: '2026-02-03T12:00:00Z',
      metadata: {
        author: 'Isabella Rodriguez',
        version: '2.1.0',
        downloads: 16700,
      },
      groupId: '1-1-3'
    },
  ],
  '1-1-4': [ // Performance
    {
      id: 'item-perf-1',
      title: 'Bundle Optimization',
      description: 'Code splitting and bundle size optimization strategies',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['performance', 'optimization', 'webpack'],
      start: '2026-01-05T09:00:00Z',
      end: '2026-04-20T16:00:00Z',
      createdAt: '2026-01-14T10:30:00Z',
      updatedAt: '2026-02-11T14:45:00Z',
      metadata: {
        author: 'Ethan Martinez',
        version: '1.9.0',
        downloads: 22400,
      },
      groupId: '1-1-4'
    },
  ],
  '1-2-3': [ // Microservices
    {
      id: 'item-micro-1',
      title: 'Service Mesh Architecture',
      description: 'Istio-based service mesh for microservices communication',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['microservices', 'istio', 'architecture'],
      start: '2025-12-20T09:00:00Z',
      end: '2026-03-15T17:00:00Z',
      createdAt: '2026-01-11T09:00:00Z',
      updatedAt: '2026-02-09T16:00:00Z',
      metadata: {
        author: 'Mia Thompson',
        version: '1.6.0',
        downloads: 13900,
      },
      groupId: '1-2-3'
    },
  ],
  '1-2-4': [ // Security
    {
      id: 'item-security-1',
      title: 'OAuth 2.0 Implementation',
      description: 'Secure authentication and authorization system',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['security', 'oauth', 'authentication'],
      start: '2025-11-10T08:00:00Z',
      end: '2026-02-05T10:30:00Z',
      createdAt: '2026-01-04T08:00:00Z',
      updatedAt: '2026-02-02T10:30:00Z',
      metadata: {
        author: 'Alexander Lee',
        version: '3.1.0',
        downloads: 28600,
      },
      groupId: '1-2-4'
    },
  ],
  '1-3-3': [ // Monitoring
    {
      id: 'item-monitor-1',
      title: 'Application Monitoring',
      description: 'Real-time monitoring with Prometheus and Grafana',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['monitoring', 'prometheus', 'grafana'],
      start: '2025-12-15T09:00:00Z',
      end: '2026-05-10T17:00:00Z',
      createdAt: '2026-01-09T09:30:00Z',
      updatedAt: '2026-02-15T15:00:00Z',
      metadata: {
        author: 'Charlotte Brown',
        version: '2.4.0',
        downloads: 20100,
      },
      groupId: '1-3-3'
    },
  ],
  '2-1-1': [ // SEO
    {
      id: 'item-seo-1',
      title: 'SEO Optimization Tools',
      description: 'Automated SEO analysis and optimization recommendations',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['seo', 'marketing', 'analytics'],
      start: '2026-01-01T09:00:00Z',
      end: '2026-03-05T13:00:00Z',
      createdAt: '2026-01-13T10:00:00Z',
      updatedAt: '2026-02-12T12:30:00Z',
      metadata: {
        author: 'Benjamin Clark',
        version: '1.8.0',
        downloads: 15300,
      },
      groupId: '2-1-1'
    },
  ],
  '2-1-2': [ // SEM
    {
      id: 'item-sem-1',
      title: 'Google Ads Campaign',
      description: 'Automated Google Ads campaign management and optimization',
      imageUrl: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['sem', 'ads', 'marketing'],
      start: '2026-01-10T09:00:00Z',
      end: '2026-02-28T12:00:00Z',
      createdAt: '2026-01-16T09:00:00Z',
      updatedAt: '2026-02-13T11:00:00Z',
      metadata: {
        author: 'Ava Wilson',
        version: '2.2.0',
        downloads: 12700,
      },
      groupId: '2-1-2'
    },
  ],
  '2-1-3': [ // Social Media
    {
      id: 'item-social-1',
      title: 'Social Media Scheduler',
      description: 'Multi-platform social media post scheduling and analytics',
      imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'medium',
      tags: ['social', 'marketing', 'automation'],
      start: '2025-11-25T09:00:00Z',
      end: '2026-02-10T15:00:00Z',
      createdAt: '2026-01-08T10:30:00Z',
      updatedAt: '2026-02-07T14:00:00Z',
      metadata: {
        author: 'Lucas Harris',
        version: '2.0.0',
        downloads: 18400,
      },
      groupId: '2-1-3'
    },
  ],
  '2-2-1': [ // Blog
    {
      id: 'item-blog-1',
      title: 'Technical Blog Platform',
      description: 'Developer blog with markdown support and syntax highlighting',
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['blog', 'content', 'markdown'],
      start: '2025-12-18T09:00:00Z',
      end: '2026-04-10T14:00:00Z',
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-02-10T13:00:00Z',
      metadata: {
        author: 'Amelia Moore',
        version: '1.6.0',
        downloads: 11800,
      },
      groupId: '2-2-1'
    },
  ],
  '2-2-2': [ // Video
    {
      id: 'item-video-1',
      title: 'Video Tutorial Series',
      description: 'Educational video content production and hosting',
      imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'high',
      tags: ['video', 'education', 'content'],
      start: '2026-02-01T10:00:00Z',
      end: '2026-03-20T16:00:00Z',
      createdAt: '2026-02-03T11:00:00Z',
      updatedAt: '2026-02-16T15:30:00Z',
      metadata: {
        author: 'Mason Taylor',
        version: '1.1.0',
        downloads: 7900,
      },
      groupId: '2-2-2'
    },
  ],
  '2-2-3': [ // Documentation
    {
      id: 'item-docs-1',
      title: 'API Documentation',
      description: 'Interactive API documentation with code examples',
      imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['documentation', 'api', 'developer'],
      start: '2025-11-20T08:00:00Z',
      end: '2026-02-10T11:00:00Z',
      createdAt: '2026-01-05T08:30:00Z',
      updatedAt: '2026-02-04T10:00:00Z',
      metadata: {
        author: 'Harper Anderson',
        version: '3.0.0',
        downloads: 24800,
      },
      groupId: '2-2-3'
    },
  ],
  '3-1-1': [ // Fortune 500
    {
      id: 'item-f500-1',
      title: 'Enterprise Sales Strategy',
      description: 'Strategic approach for Fortune 500 client acquisition',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['enterprise', 'sales', 'strategy'],
      start: '2026-01-02T09:00:00Z',
      end: '2026-05-15T17:00:00Z',
      createdAt: '2026-01-12T09:30:00Z',
      updatedAt: '2026-02-14T16:00:00Z',
      metadata: {
        author: 'Evelyn Thomas',
        version: '2.1.0',
        downloads: 9200,
      },
      groupId: '3-1-1'
    },
  ],
  '3-1-2': [ // Mid-Market
    {
      id: 'item-midmarket-1',
      title: 'Mid-Market CRM Integration',
      description: 'Salesforce integration for mid-market sales pipeline',
      imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['crm', 'salesforce', 'integration'],
      start: '2025-12-10T09:00:00Z',
      end: '2026-03-20T15:00:00Z',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-02-11T14:30:00Z',
      metadata: {
        author: 'Jackson White',
        version: '1.7.0',
        downloads: 13400,
      },
      groupId: '3-1-2'
    },
  ],
  '3-2-1': [ // Startups
    {
      id: 'item-startup-1',
      title: 'Startup Onboarding Kit',
      description: 'Quick-start package for startup customers',
      imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'medium',
      tags: ['startup', 'onboarding', 'sales'],
      start: '2026-01-10T09:00:00Z',
      end: '2026-02-15T12:00:00Z',
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-02-08T11:00:00Z',
      metadata: {
        author: 'Abigail Martin',
        version: '1.4.0',
        downloads: 10600,
      },
      groupId: '3-2-1'
    },
  ],
  '3-2-2': [ // Small Business
    {
      id: 'item-smb-1',
      title: 'SMB Pricing Calculator',
      description: 'Dynamic pricing tool for small business clients',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['pricing', 'smb', 'sales'],
      start: '2026-01-15T10:00:00Z',
      end: '2026-04-05T13:00:00Z',
      createdAt: '2026-01-22T10:30:00Z',
      updatedAt: '2026-02-15T12:00:00Z',
      metadata: {
        author: 'Sebastian Lopez',
        version: '1.5.0',
        downloads: 8700,
      },
      groupId: '3-2-2'
    },
  ],

  // Level 4 Leaf Nodes (기존 데이터)
  '1-1-1-1': [ // Component Library
    {
      id: 'item-1',
      title: 'Button Component',
      description: 'Reusable button component with multiple variants and sizes',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['component', 'ui', 'vue'],
      start: '2025-01-20T09:00:00Z',
      end: '2025-05-05T15:00:00Z',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2026-02-01T14:30:00Z',
      metadata: {
        author: 'Alice Johnson',
        version: '1.2.0',
        downloads: 15420,
      },
      groupId: '1-1-1-1'
    },
    {
      id: 'item-2',
      title: 'Input Field Component',
      description: 'Form input component with validation and error handling',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['component', 'form', 'validation'],
      start: '2026-01-12T09:00:00Z',
      end: '2026-03-18T12:00:00Z',
      createdAt: '2026-01-20T09:15:00Z',
      updatedAt: '2026-02-10T11:20:00Z',
      metadata: {
        author: 'Bob Smith',
        version: '2.0.0',
        downloads: 12350,
      },
      groupId: '1-1-1-1'
    },
    {
      id: 'item-3',
      title: 'Modal Component',
      description: 'Accessible modal dialog with customizable content and actions',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'medium',
      tags: ['component', 'dialog', 'overlay'],
      start: '2025-01-28T10:00:00Z',
      end: '2026-02-25T17:00:00Z',
      createdAt: '2026-02-01T13:45:00Z',
      updatedAt: '2026-02-15T16:00:00Z',
      metadata: {
        author: 'Carol Davis',
        version: '1.0.0-beta',
        downloads: 8200,
      },
      groupId: '1-1-1-1'
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
      start: '2025-11-15T08:00:00Z',
      end: '2026-01-30T11:00:00Z',
      createdAt: '2026-01-10T08:00:00Z',
      updatedAt: '2026-01-25T10:30:00Z',
      metadata: {
        author: 'David Lee',
        version: '3.1.0',
        downloads: 25600,
      },
      groupId: '1-1-1-2'
    },
    {
      id: 'item-5',
      title: 'Composable Helpers',
      description: 'Reusable composables for common state patterns',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['composables', 'helpers', 'utils'],
      start: '2026-01-08T10:00:00Z',
      end: '2026-04-22T14:00:00Z',
      createdAt: '2026-01-18T11:30:00Z',
      updatedAt: '2026-02-12T09:45:00Z',
      metadata: {
        author: 'Emma Wilson',
        version: '2.3.0',
        downloads: 18900,
      },
      groupId: '1-1-1-2'
    },
  ],
  '1-1-1-3': [ // Routing
    {
      id: 'item-routing-1',
      title: 'Vue Router Setup',
      description: 'Nested routing configuration with lazy loading',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['vue', 'router', 'navigation'],
      start: '2025-12-05T09:00:00Z',
      end: '2026-02-10T13:00:00Z',
      createdAt: '2026-01-14T09:00:00Z',
      updatedAt: '2026-02-06T12:00:00Z',
      metadata: {
        author: 'Frank Miller',
        version: '2.1.0',
        downloads: 19500,
      },
      groupId: '1-1-1-3'
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
      start: '2025-12-22T10:00:00Z',
      end: '2026-02-08T13:00:00Z',
      createdAt: '2026-01-12T14:20:00Z',
      updatedAt: '2026-02-05T12:10:00Z',
      metadata: {
        author: 'Frank Miller',
        version: '1.5.0',
        downloads: 22100,
      },
      groupId: '1-1-2-1'
    },
  ],
  '1-1-2-2': [ // Context API
    {
      id: 'item-context-1',
      title: 'Theme Context Provider',
      description: 'React context for managing app theme and dark mode',
      imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['react', 'context', 'theme'],
      start: '2026-01-05T09:00:00Z',
      end: '2026-03-12T14:00:00Z',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-02-11T13:30:00Z',
      metadata: {
        author: 'Grace Harper',
        version: '1.3.0',
        downloads: 16800,
      },
      groupId: '1-1-2-2'
    },
  ],
  '1-1-2-3': [ // Server Components
    {
      id: 'item-rsc-1',
      title: 'React Server Components',
      description: 'Next.js 13+ server components implementation',
      imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
      status: 'pending',
      priority: 'high',
      tags: ['react', 'nextjs', 'rsc'],
      start: '2026-02-01T09:00:00Z',
      end: '2026-03-15T12:00:00Z',
      createdAt: '2026-02-05T09:30:00Z',
      updatedAt: '2026-02-17T11:00:00Z',
      metadata: {
        author: 'Henry Park',
        version: '0.9.0-beta',
        downloads: 5400,
      },
      groupId: '1-1-2-3'
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
      start: '2025-11-10T08:00:00Z',
      end: '2026-02-20T16:00:00Z',
      createdAt: '2026-01-08T09:00:00Z',
      updatedAt: '2026-02-18T15:30:00Z',
      metadata: {
        author: 'Grace Chen',
        version: '4.0.0',
        downloads: 35000,
      },
      groupId: '1-2-1-1'
    },
    {
      id: 'item-8',
      title: 'Product API',
      description: 'Product catalog and inventory management endpoints',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['api', 'products', 'inventory'],
      start: '2026-01-15T09:00:00Z',
      end: '2026-05-05T12:00:00Z',
      createdAt: '2026-01-22T10:15:00Z',
      updatedAt: '2026-02-16T11:45:00Z',
      metadata: {
        author: 'Henry Park',
        version: '3.2.0',
        downloads: 28400,
      },
      groupId: '1-2-1-1'
    },
  ],
  '1-2-1-2': [ // GraphQL
    {
      id: 'item-graphql-1',
      title: 'GraphQL Schema Design',
      description: 'Type-safe GraphQL API with Apollo Server',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['graphql', 'apollo', 'api'],
      start: '2026-01-08T09:00:00Z',
      end: '2026-04-15T15:00:00Z',
      createdAt: '2026-01-16T09:30:00Z',
      updatedAt: '2026-02-13T14:00:00Z',
      metadata: {
        author: 'Isabella Rodriguez',
        version: '2.4.0',
        downloads: 20700,
      },
      groupId: '1-2-1-2'
    },
  ],
  '1-2-1-3': [ // WebSocket
    {
      id: 'item-ws-1',
      title: 'Real-time WebSocket Server',
      description: 'Bidirectional real-time communication with Socket.io',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['websocket', 'realtime', 'socketio'],
      start: '2026-01-12T09:00:00Z',
      end: '2026-03-25T16:00:00Z',
      createdAt: '2026-01-21T10:00:00Z',
      updatedAt: '2026-02-14T15:30:00Z',
      metadata: {
        author: 'James Wilson',
        version: '1.8.0',
        downloads: 17900,
      },
      groupId: '1-2-1-3'
    },
  ],
  '1-2-2-1': [ // PostgreSQL
    {
      id: 'item-postgres-1',
      title: 'PostgreSQL Database Design',
      description: 'Normalized database schema with indexing strategies',
      imageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['postgresql', 'database', 'schema'],
      start: '2025-11-25T08:00:00Z',
      end: '2026-02-15T12:00:00Z',
      createdAt: '2026-01-09T08:30:00Z',
      updatedAt: '2026-02-07T11:00:00Z',
      metadata: {
        author: 'Katherine Lee',
        version: '3.5.0',
        downloads: 26300,
      },
      groupId: '1-2-2-1'
    },
  ],
  '1-2-2-2': [ // Redis
    {
      id: 'item-redis-1',
      title: 'Redis Caching Strategy',
      description: 'Advanced caching patterns with Redis',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['redis', 'cache', 'performance'],
      start: '2026-01-05T09:00:00Z',
      end: '2026-02-10T14:00:00Z',
      createdAt: '2026-01-17T09:00:00Z',
      updatedAt: '2026-02-12T13:00:00Z',
      metadata: {
        author: 'Liam Martinez',
        version: '2.2.0',
        downloads: 21400,
      },
      groupId: '1-2-2-2'
    },
    {
      id: 'item-redis-2',
      title: 'Redis Pub/Sub Implementation',
      description: 'Real-time messaging with Redis Pub/Sub',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['redis', 'pubsub', 'realtime'],
      start: '2026-02-20T10:00:00Z',
      end: '2026-03-30T15:00:00Z',
      createdAt: '2026-02-14T10:30:00Z',
      updatedAt: '2026-02-22T14:30:00Z',
      metadata: {
        author: 'Liam Martinez',
        version: '2.2.0',
        downloads: 21400,
      },
      groupId: '1-2-2-2'
    }
  ],
  '1-2-2-3': [ // MongoDB
    {
      id: 'item-mongo-1',
      title: 'MongoDB Collections',
      description: 'Document database schema and aggregation pipelines',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['mongodb', 'nosql', 'database'],
      start: '2026-01-18T10:00:00Z',
      end: '2026-03-30T15:00:00Z',
      createdAt: '2026-01-23T10:30:00Z',
      updatedAt: '2026-02-15T14:30:00Z',
      metadata: {
        author: 'Mia Thompson',
        version: '1.7.0',
        downloads: 14800,
      },
      groupId: '1-2-2-3'
    },
  ],
  '1-3-1-1': [ // AWS
    {
      id: 'item-aws-1',
      title: 'AWS Infrastructure',
      description: 'Cloud infrastructure setup with Terraform',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'critical',
      tags: ['aws', 'cloud', 'terraform'],
      start: '2025-11-05T08:00:00Z',
      end: '2026-02-10T11:00:00Z',
      createdAt: '2026-01-06T08:00:00Z',
      updatedAt: '2026-02-03T10:00:00Z',
      metadata: {
        author: 'Noah Anderson',
        version: '3.3.0',
        downloads: 30200,
      },
      groupId: '1-3-1-1'
    },
  ],
  '1-3-1-2': [ // Docker
    {
      id: 'item-docker-1',
      title: 'Docker Containerization',
      description: 'Multi-stage Docker builds for optimized containers',
      imageUrl: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['docker', 'containers', 'devops'],
      start: '2025-12-15T09:00:00Z',
      end: '2026-04-12T13:00:00Z',
      createdAt: '2026-01-11T09:30:00Z',
      updatedAt: '2026-02-10T12:30:00Z',
      metadata: {
        author: 'Olivia Brown',
        version: '2.6.0',
        downloads: 25700,
      },
      groupId: '1-3-1-2'
    },
  ],
  '1-3-1-3': [ // Kubernetes
    {
      id: 'item-k8s-1',
      title: 'Kubernetes Deployment',
      description: 'Production-ready K8s manifests and Helm charts',
      imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'critical',
      tags: ['kubernetes', 'k8s', 'orchestration'],
      start: '2026-01-10T09:00:00Z',
      end: '2026-05-20T17:00:00Z',
      createdAt: '2026-01-19T10:00:00Z',
      updatedAt: '2026-02-16T16:00:00Z',
      metadata: {
        author: 'Patrick Clark',
        version: '2.8.0',
        downloads: 23600,
      },
      groupId: '1-3-1-3'
    },
  ],
  '1-3-2-1': [ // GitHub Actions
    {
      id: 'item-gha-1',
      title: 'CI/CD Pipeline',
      description: 'Automated testing and deployment with GitHub Actions',
      imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=300&fit=crop',
      status: 'completed',
      priority: 'high',
      tags: ['github', 'cicd', 'automation'],
      start: '2025-12-08T09:00:00Z',
      end: '2026-02-12T14:00:00Z',
      createdAt: '2026-01-13T09:00:00Z',
      updatedAt: '2026-02-08T13:00:00Z',
      metadata: {
        author: 'Quinn Davis',
        version: '2.5.0',
        downloads: 27800,
      },
      groupId: '1-3-2-1'
    },
  ],
  '1-3-2-2': [ // Jenkins
    {
      id: 'item-jenkins-1',
      title: 'Jenkins Pipeline',
      description: 'Declarative pipeline for legacy systems',
      imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=300&fit=crop',
      status: 'archived',
      priority: 'low',
      tags: ['jenkins', 'cicd', 'legacy'],
      start: '2025-11-01T08:00:00Z',
      end: '2026-02-05T10:00:00Z',
      createdAt: '2026-01-02T08:00:00Z',
      updatedAt: '2026-01-30T10:00:00Z',
      metadata: {
        author: 'Rachel Miller',
        version: '1.2.0',
        downloads: 8900,
      },
      groupId: '1-3-2-2'
    },
  ],
  '1-3-2-3': [ // GitLab CI
    {
      id: 'item-gitlab-1',
      title: 'GitLab CI/CD Pipeline',
      description: 'Modern CI/CD with GitLab runners and auto-scaling',
      imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'high',
      tags: ['gitlab', 'cicd', 'automation'],
      start: '2026-01-10T09:00:00Z',
      end: '2026-03-30T17:00:00Z',
      createdAt: '2026-01-15T09:30:00Z',
      updatedAt: '2026-02-18T15:00:00Z',
      metadata: {
        author: 'Nathan Scott',
        version: '2.3.0',
        downloads: 14200,
      },
      groupId: '1-3-2-3'
    },
  ],
  '1-3-2-4': [ // CircleCI
    {
      id: 'item-circle-1',
      title: 'CircleCI Configuration',
      description: 'Fast and reliable CircleCI build pipelines',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      status: 'active',
      priority: 'medium',
      tags: ['circleci', 'cicd', 'docker'],
      start: '2026-01-05T08:00:00Z',
      end: '2026-03-15T16:00:00Z',
      createdAt: '2026-01-12T08:30:00Z',
      updatedAt: '2026-02-16T14:00:00Z',
      metadata: {
        author: 'Victoria Brooks',
        version: '1.9.0',
        downloads: 11800,
      },
      groupId: '1-3-2-4'
    },
  ],
}

/**
 * 특정 그룹의 아이템들 조회
 */
export const getItemsByGroupId = (groupId) => {
  return itemsData[groupId] || []
}

/**
 * 모든 그룹의 아이템들 조회
 */
export const getAllItems = () => {
  return Object.values(itemsData).flat()
}

/**
 * 특정 아이템 상세 정보 조회
 */
export const getItemById = (itemId) => {
  const allItems = getAllItems()
  return allItems.find(item => item.id === itemId) || null
}
