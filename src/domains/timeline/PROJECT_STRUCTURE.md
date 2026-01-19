# Timeline API Integration - Project Structure

## 📁 Directory Structure

```
src/domains/timeline/
│
├── types.ts
│   └── ProjectTask, ProjectGroup, TimelineItem, TransformedTimelineData 정의
│
├── api/
│   └── timeline.api.ts
│       ├── fetchTimelineProject()      - Mock API (실제 프로젝트 데이터)
│       ├── fetchTaskDetails()          - 작업 상세 조회
│       └── [프로덕션] 실제 API 엔드포인트로 변경
│
├── utils/
│   └── dataTransformer.ts
│       ├── transformTaskToTimelineItem()     - Task → TimelineItem 변환
│       ├── transformGroupToTimelineGroup()   - Group → TimelineGroup 변환
│       ├── transformProjectToTimeline()      - 전체 데이터 변환
│       ├── generateTaskDetailHtml()          - 상세 정보 HTML 생성
│       ├── STATUS_CONFIG                     - 상태별 스타일
│       └── PRIORITY_CONFIG                   - 우선순위 아이콘
│
├── composables/
│   ├── useTimeline.ts                   - Timeline 인스턴스 관리
│   └── useTimelineProjectData.ts        - 프로젝트 데이터 상태 관리
│       ├── loading                      - 로딩 상태
│       ├── error                        - 에러 메시지
│       ├── items                        - TimelineItem[]
│       ├── groups                       - TimelineGroup[]
│       ├── selectedTaskDetail           - 선택된 작업
│       ├── selectedTaskDetailHtml       - 렌더링된 HTML
│       ├── loadProject()                - 데이터 로드
│       ├── selectTask()                 - 작업 선택
│       ├── clearSelection()             - 선택 초기화
│       ├── getTaskCountByGroup()        - 그룹별 아이템 수
│       └── getProgressStats()           - 진행률 통계
│
├── examples/
│   ├── api/
│   │   └── ApiProjectExample.vue        ⭐️ API 통합 예제 (메인)
│   │       ├── Loading State
│   │       ├── Error State
│   │       ├── Sidebar (통계, 팀 정보)
│   │       ├── Timeline Area (메인)
│   │       └── Details Panel (상세 정보)
│   │
│   ├── interaction/
│   │   ├── SetSelectionExample.vue
│   │   ├── EventListenersExample.vue
│   │   ├── ClickToUseExample.vue
│   │   ├── AnimateWindowExample.vue
│   │   └── NavigationMenuExample.vue
│   │
│   ├── items/
│   │   ├── PointItemsExample.vue
│   │   ├── BackgroundAreasExample.vue
│   │   ├── HtmlContentsExample.vue
│   │   └── TooltipExample.vue
│   │
│   └── groups/
│       └── GroupsExample.vue
│
└── API_INTEGRATION.md               - 아키텍처 가이드

src/pages/
└── TimelineExamplesPage.vue        - 예제 목록 페이지
    ├── 좌측: 카테고리별 네비게이션
    └── 우측: 선택된 예제 표시

src/router/index.ts
└── /timeline-examples 라우트 추가
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Server                               │
│                                                                  │
│  GET /api/projects/timeline                                     │
│  {                                                              │
│    groups: ProjectGroup[],                                      │
│    tasks: ProjectTask[]                                         │
│  }                                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API Layer                                     │
│              (timeline.api.ts)                                  │
│                                                                  │
│  fetchTimelineProject() → Promise<TimelineProject>             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               Data Transformer                                  │
│            (dataTransformer.ts)                                 │
│                                                                  │
│  transformProjectToTimeline()                                  │
│  ├─ transformTaskToTimelineItem()    (with HTML content)       │
│  ├─ transformGroupToTimelineGroup()                            │
│  └─ generateTaskDetailHtml()         (detailed view)           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│             Composable Layer                                    │
│        (useTimelineProjectData.ts)                             │
│                                                                  │
│  ├─ loading: boolean                                           │
│  ├─ error: string | null                                       │
│  ├─ items: TimelineItem[]                                      │
│  ├─ groups: TimelineGroup[]                                    │
│  ├─ selectedTaskDetail: ProjectTask | null                    │
│  └─ selectedTaskDetailHtml: string | null                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                Vue Component                                    │
│          (ApiProjectExample.vue)                               │
│                                                                  │
│  ┌──────────────────┬──────────────────┬────────────────────┐  │
│  │                  │                  │                    │  │
│  │  Sidebar         │  Timeline        │  Details Panel     │  │
│  │  ────────────    │  ────────────    │  ──────────────    │  │
│  │  Statistics      │  vis-timeline    │  Task Details      │  │
│  │  Teams Info      │  (groups/items)  │  (HTML Content)    │  │
│  │  Selection       │  Events          │  Images            │  │
│  │                  │                  │  Progress          │  │
│  │                  │                  │  Info              │  │
│  └──────────────────┴──────────────────┴────────────────────┘  │
│                                                                  │
│  Event Handlers:                                               │
│  ├─ handleTimelineSelect()  → selectTask()                    │
│  ├─ clearSelection()        → clearSelection()                │
│  └─ loadProject()           → loadProject()                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Component Interaction

### ApiProjectExample.vue

```vue
┌─────────────────────────────────────────┐ │ ApiProjectExample.vue │ │ │ │ Props: None │ │ Emits:
None │ │ │ │ Lifecycle: │ │ ├─ onMounted() │ │ │ ├─ await loadProject() │ │ │ ├─ new useTimeline() │
│ │ └─ timeline.on('select', ...) │ │ │ │ │ │ State: │ │ │ ├─ timelineEl: HTMLDivElement │ │ │ ├─
detailsEl: HTMLDivElement │ │ │ ├─ timeline: Timeline instance │ │ │ ├─ loading: boolean │ │ │ ├─
error: string | null │ │ │ ├─ items: TimelineItem[] │ │ │ ├─ groups: TimelineGroup[] │ │ │ ├─ stats:
Statistics │ │ │ └─ selectedTaskDetail: ProjectTask │ │ │ │ │ │ Methods: │ │ │ ├─
handleTimelineSelect() │ │ │ └─ clearSelection() │ └─────────────────────────────────────────┘
```

## 📊 Data Transformation Pipeline

```
API Response
{
  groups: [
    { id: 1, name: "Frontend", ... }
  ],
  tasks: [
    {
      id: 1,
      groupId: 1,
      title: "Design System",
      imageUrl: "...",
      status: "completed",
      ...
    }
  ]
}
        │
        ▼
transformProjectToTimeline()
        │
        ├─► transformGroupToTimelineGroup()
        │   └─► { id: 1, content: "<div>Frontend</div>", title: "..." }
        │
        ├─► transformTaskToTimelineItem()
        │   └─► {
        │       id: 1,
        │       group: 1,
        │       content: "<div style='...'><img src='...' /><div>Design System</div>...</div>",
        │       start: "2020-08-01",
        │       end: "2020-08-10",
        │       className: "status-completed priority-high"
        │     }
        │
        └─► generateTaskDetailHtml()
            └─► "<div style='...'><img src='...' /><h2>Design System</h2>...</div>"
```

## 🎨 HTML Content Structure

Timeline Item HTML (TimelineItem.content):

```
┌──────────────────────────────────┐
│ TaskImage  │ Title              │
│  [60x60]   │ Description        │
│            │ Status Priority    │
│            │ Progress Bar       │
└──────────────────────────────────┘
```

Detail Panel HTML (generateTaskDetailHtml):

```
┌────────────────────────────────────────┐
│          Task Image [Full]             │
│  Title                                 │
│  Description                           │
│                                        │
│  Status: [Badge]  Priority: [Badge]    │
│  Progress: [ProgressBar] 75%           │
│                                        │
│  Assignee: Alice Johnson               │
│  Timeline: 2020-08-01 - 2020-08-10    │
│                                        │
│  Tags: [Vue] [Design] [Setup]         │
│                                        │
│  Objectives      │ Deliverables       │
│  • Create comp   │ • Component lib    │
│  • Design tokens │ • Storybook setup  │
│                  │                    │
│  Resources                             │
│  • Vue 3 docs                         │
│  • Design tools                       │
└────────────────────────────────────────┘
```

## 🚀 Usage Flow

1. **페이지 로드**

   ```
   TimelineExamplesPage → ApiProjectExample.vue 선택
   ```

2. **데이터 로드**

   ```
   loadProject()
   → fetchTimelineProject()
   → transformProjectToTimeline()
   → items & groups 업데이트
   ```

3. **Timeline 초기화**

   ```
   useTimeline(el, items)
   → groups와 items로 Timeline 렌더
   ```

4. **사용자 상호작용**
   ```
   Click Item
   → handleTimelineSelect()
   → selectTask(itemId)
   → fetchTaskDetails()
   → generateTaskDetailHtml()
   → 상세 정보 표시
   ```

## 🔐 Type Safety

모든 데이터 변환이 타입체크됨:

```typescript
// API Response
const project: TimelineProject = await fetchTimelineProject()

// Transformed Data
const transformed: TransformedTimelineData =
  transformProjectToTimeline(project.groups, project.tasks)

// Timeline Items
const items: TimelineItem[] = transformed.items

// HTML Generation
const html: string = generateTaskDetailHtml(task: ProjectTask)
```

## ✅ Best Practices Checklist

- ✅ **관심사의 분리** (types, api, utils, composables, components)
- ✅ **타입 안전성** (모든 함수에 타입 지정)
- ✅ **에러 처리** (try-catch, error 상태)
- ✅ **로딩 상태** (loading boolean)
- ✅ **단일 책임** (각 함수 = 하나의 책임)
- ✅ **HTML Content** (이미지 + 상세 정보)
- ✅ **Stateful Composable** (재사용 가능)
- ✅ **이벤트 처리** (선택, 클릭)
- ✅ **상태 초기화** (clearSelection)
- ✅ **통계 계산** (getProgressStats)
