# Timeline API Integration - Architecture & Best Practices

## 📋 Overview

API를 이용한 프로젝트 관리 타임라인 시스템의 구현 예제입니다. 이 구조는 **확장성**, **유지보수성**, **타입 안전성**을 고려하여 설계되었습니다.

## 🏗️ Architecture

```
src/domains/timeline/
├── types.ts                           # 데이터 모델 정의
├── api/
│   └── timeline.api.ts               # API 호출 함수
├── utils/
│   └── dataTransformer.ts            # 데이터 변환 로직
├── composables/
│   ├── useTimeline.ts                # Timeline 인스턴스 관리
│   └── useTimelineProjectData.ts     # 프로젝트 데이터 관리
└── examples/
    ├── api/
    │   └── ApiProjectExample.vue     # API 통합 예제
    └── ...
```

## 🔄 Data Flow

```
API Response
    ↓
DataTransformer (변환)
    ↓
TimelineItem + Group 생성
    ↓
Timeline Initialization
    ↓
Event Handlers (selectTask)
    ↓
Detailed View Rendering
```

## 📊 Data Models

### ProjectTask (API 응답)

```typescript
interface ProjectTask {
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
  details: {
    objectives: string[]
    deliverables: string[]
    resources: string[]
  }
}
```

### TimelineItem (Timeline 렌더링)

```typescript
interface TimelineItem {
  id: number
  content: string // HTML content with image & details
  start: string
  end?: string
  group?: number
  title?: string // Tooltip content
  className?: string // CSS class for styling
}
```

## 🎨 Best Practices 적용

### 1. **Separation of Concerns (관심사의 분리)**

- **types.ts**: 데이터 구조 정의만
- **api/**: API 호출 로직만
- **utils/**: 데이터 변환 로직만
- **composables/**: 상태 관리 및 비즈니스 로직
- **components/**: UI 렌더링만

### 2. **Type Safety (타입 안전성)**

```typescript
// ✅ Good: 타입이 명확함
const transformTaskToTimelineItem = (task: ProjectTask): TimelineItem => {
  // ...
}

// ❌ Bad: any 타입 사용
const transform = (task: any): any => {
  // ...
}
```

### 3. **Single Responsibility (단일 책임)**

각 함수는 하나의 책임만 가짐:

- `transformTaskToTimelineItem`: Task → TimelineItem 변환
- `generateTaskDetailHtml`: HTML 상세 정보 생성
- `useTimelineProjectData`: 데이터 상태 관리

### 4. **Error Handling (에러 처리)**

```typescript
// ✅ Good: 에러 처리 포함
const loadProject = async () => {
  loading.value = true
  error.value = null

  try {
    const project = await fetchTimelineProject()
    data.value = transformProjectToTimeline(project.groups, project.tasks)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load project data'
  } finally {
    loading.value = false
  }
}
```

### 5. **Composition Pattern (합성 패턴)**

```typescript
// ✅ Good: Composable 조합
const { loading, items, groups, selectTask, loadProject } = useTimelineProjectData()
```

### 6. **HTML Content Rendering**

Timeline 아이템에 HTML 콘텐츠로 이미지와 상세 정보 표시:

```typescript
const htmlContent = `
  <div style="padding: 8px;">
    <img src="${task.imageUrl}" style="width: 60px; height: 60px; border-radius: 4px;" />
    <div style="font-weight: 600;">${task.title}</div>
    <div>Status: ${statusConfig.label}</div>
    <div style="progress bar"></div>
  </div>
`
```

## 💡 Key Features

### 1. **Mock API**

```typescript
export const fetchTimelineProject = async (): Promise<TimelineProject>
```

- 500ms 지연으로 실제 API 동작 시뮬레이션
- 프로덕션 환경에서는 실제 엔드포인트로 변경 가능

### 2. **Data Transformation**

```typescript
// Status별 색상 설정
const STATUS_CONFIG = {
  planning: { color: '#f59e0b', label: 'Planning' },
  'in-progress': { color: '#3b82f6', label: 'In Progress' },
  completed: { color: '#10b981', label: 'Completed' },
  'on-hold': { color: '#ef4444', label: 'On Hold' },
}

// Priority별 아이콘
const PRIORITY_CONFIG = {
  critical: { emoji: '🔴', label: 'Critical' },
  high: { emoji: '🟠', label: 'High' },
  medium: { emoji: '🟡', label: 'Medium' },
  low: { emoji: '🟢', label: 'Low' },
}
```

### 3. **Stateful Composable**

```typescript
const {
  loading, // 로딩 상태
  error, // 에러 메시지
  items, // Timeline 아이템
  groups, // Timeline 그룹
  selectedTaskDetail, // 선택된 작업 상세
  selectedTaskDetailHtml, // HTML 상세 정보
  loadProject, // 데이터 로드
  selectTask, // 작업 선택
  clearSelection, // 선택 초기화
  getProgressStats, // 통계 조회
} = useTimelineProjectData()
```

## 🚀 Usage Example

```vue
<script setup>
import { useTimelineProjectData } from '@/domains/timeline/composables/useTimelineProjectData'

const {
  loading,
  items,
  groups,
  selectedTaskDetail,
  selectedTaskDetailHtml,
  loadProject,
  selectTask,
} = useTimelineProjectData()

onMounted(async () => {
  await loadProject()

  // Timeline 초기화
  const timeline = useTimeline(timelineEl, items.value)

  // 선택 이벤트
  timeline.on('select', (properties) => {
    if (properties.items.length > 0) {
      selectTask(properties.items[0])
    }
  })
})
</script>
```

## 🔌 API Integration Checklist

프로덕션 환경에서 실제 API로 변경하려면:

- [ ] `timeline.api.ts`의 Mock 함수를 실제 API 호출로 변경
- [ ] API 응답 타입이 `ProjectTask`, `ProjectGroup` 인터페이스와 일치하는지 확인
- [ ] 에러 처리 및 재시도 로직 추가
- [ ] 응답 데이터 캐싱 고려
- [ ] 페이지네이션 처리 (많은 데이터인 경우)

## 📝 API Response Format

실제 API는 다음 형식으로 응답해야 합니다:

```json
{
  "groups": [
    {
      "id": 1,
      "name": "Frontend Development",
      "description": "Vue.js and UI components",
      "teamLead": "Alice Johnson",
      "memberCount": 5
    }
  ],
  "tasks": [
    {
      "id": 1,
      "groupId": 1,
      "title": "Design System Setup",
      "description": "Setup Vue components and design tokens",
      "imageUrl": "https://...",
      "status": "completed",
      "priority": "high",
      "assignee": "Alice Johnson",
      "startDate": "2020-08-01",
      "endDate": "2020-08-10",
      "progress": 100,
      "tags": ["Vue", "Design"],
      "details": {
        "objectives": ["Create components"],
        "deliverables": ["Component library"],
        "resources": ["Vue docs"]
      }
    }
  ]
}
```

## 🎯 Performance Considerations

1. **가상 스크롤링**: 아이템이 많은 경우 고려
2. **이미지 최적화**: 이미지 URL에 width/height 파라미터 추가
3. **Lazy Loading**: 필요시 작업 상세정보 lazy load
4. **캐싱**: 동일한 데이터 재요청 방지

## 🧪 Testing

```typescript
// ✅ Composable 테스트
describe('useTimelineProjectData', () => {
  it('should load project data', async () => {
    const { loadProject, items } = useTimelineProjectData()
    await loadProject()
    expect(items.value.length).toBeGreaterThan(0)
  })

  it('should transform task to timeline item', () => {
    const task: ProjectTask = {
      /* ... */
    }
    const item = transformTaskToTimelineItem(task)
    expect(item.content).toContain('html')
    expect(item.group).toBe(task.groupId)
  })
})
```

## 📚 References

- [vis-timeline Documentation](https://visjs.github.io/vis-timeline/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)

---

## 🧩 Roadmap Workspace Backend Spec (29 Mar)

workspace 하위 Timeline 리팩토링 코드에서 사용하는 백엔드 mock 계약입니다.

### 1) 목적

- timeline.store.ts 의 변환 함수(`loadItems`, `getProductItems`, `getRequireTechnologyItems`, `getTrm`)와 정합되는 응답 제공
- 제품(Item)과 필요기술(Tech) 간 parent-child 관계를 API 레벨에서 명시

### 2) API Endpoint

```http
GET /api/workspace-roadmap/items
GET /api/workspace-roadmap/items/:itemId/techs
GET /api/workspace-roadmap/items/:itemId/trm
```

### 3) Query Parameter 규약

- `roadmapType`: `PRM | TRM | COM`
- `includeInactive`: `true | false` (기본값 `false`)
- `page`: number (기본값 `0`)
- `size`: number (기본값 `10000`)

### 4) Response 규약

성공 응답 (목록):

```json
{
  "content": [],
  "page": 0,
  "size": 10000,
  "totalElements": 0
}
```

오류 응답:

```json
{
  "error": true,
  "message": "Not found",
  "code": "ITEM_NOT_FOUND"
}
```

### 5) 데이터 필드 최소 요건

#### 5-1. Product Item (`/items`)

- 필수: `id`, `nameKo/nameEn`, `devStartPlanMonth`, `devEndPlanMonth`, `roadOrgGroupProdLinkId`
- 권장: `itemStatusCode`, `itemProgStatusCode`, `trmCount`, `vehicleTypeCode`, `seqIndex`

#### 5-2. Tech Item (`/items/:itemId/techs`, `/trm`)

- 필수: `id`, `itemId`, `nameKo/nameEn`, `devStartPlanMonth`, `devEndPlanMonth`
- 권장: `technologyClassLv1Id`, `technologyClassLv2Id`, `technologyClassLv3Id`, `comTechTypeCode`

### 6) 프론트 변환 보장 포인트

- `getProductItems` 변환 시 timeline item 필수 필드 보장
  - `id`, `itemLink`, `title`, `content`, `start`, `end`, `group`, `className`
- `getRequireTechnologyItems` 변환 시 하위 기술 item 연결 필드 보장
  - `id`, `parentItemId`, `group`, `start`, `end`

### 7) 완료 기준 (DoD)

- workspace Timeline에서 item 렌더링이 깨지지 않음
- item 클릭 시 하위 tech 조회 및 표시 가능
- 없는 `itemId` 요청 시 404 또는 empty 응답이 일관되며 프론트에서 예외 없이 처리됨
