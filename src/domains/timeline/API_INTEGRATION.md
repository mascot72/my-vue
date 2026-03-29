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

---

## 🧭 workspaceNew 운영 가이드

현재 반영된 `workspaceNew` 구현의 파일 구조, 동작 개념, 핵심 변수 흐름을 정리합니다.

### 1) 파일 구조

```text
src/
├─ App.vue                                      # 상단 메뉴에 Work Roadmap New 링크
├─ router/index.ts                              # /roadmap-workspace-new 라우트 등록
├─ pages/
│  └─ RoadmapWorkspaceNewPage.vue               # 전용 페이지(헤더/컨트롤/요약/상세패널)
└─ domains/timeline/components/Roadmap/
   ├─ workspaceNew/
   │  ├─ Timeline.vue                           # vis-timeline 초기화/렌더/이벤트 연결
   │  ├─ useTimeline.ts                         # 토글/캐시/화살표/포커스 핵심 로직
   │  ├─ timeline.store.ts                      # 상태/데이터셋/API호출/캐시 flag
   │  ├─ useTimelineApi.ts                      # /api/workspace-roadmap 호출 래퍼
   │  ├─ useTimelineOption.ts                   # 타임라인 옵션/스케일 설정
   │  └─ templates.ts                           # item/group HTML 템플릿(+/- 버튼 포함)
   └─ visTimelineArrow.js                       # 부모-자식 연결선(arrow) 렌더러

server/
└─ src/
   ├─ index.js                                  # /api/workspace-roadmap 라우트 등록
   ├─ routes/workspaceRoadmap.js                # items/techs/trm endpoint
   └─ data/workspaceRoadmapData.js              # 제품/기술 mock 데이터 + pagination/filter
```

### 2) 동작 개념

1. `/roadmap-workspace-new` 진입  
   → `RoadmapWorkspaceNewPage.vue` 로드  
   → 내부에서 `workspaceNew/Timeline.vue` 렌더

2. `Timeline.vue` 마운트  
   → `store.loadItems()` 호출로 PRM(부모) 아이템 조회  
   → `itemsDS`/`groupsDS` 바인딩 후 vis-timeline 생성

3. 부모 아이템의 `+/-` 클릭  
   → `onContainerClick()`에서 `.vis-item-add` 클릭만 감지  
   → `visibleSubTechTree(true|false, parentId)` 실행

4. 펼치기(`+`) 시  
   - 캐시 ON: `restoreCachedSubTechItems()` 우선 시도 (재호출 없음)
   - 캐시 미스: `store.getTrms()` API 호출 후 child item 생성/삽입
   - child 삽입 후 `syncArrowForParent()`로 부모-자식 화살표 생성

5. 접기(`-`) 시  
   - `removeSubItems()`로 child item 제거
   - `removeArrowForParent()`로 연결선 제거
   - 캐시 OFF일 때만 `loadedItems`/캐시 삭제

### 3) 핵심 변수/상태 흐름

- `store.itemsDS` / `store.groupsDS`  
  vis-timeline에 직접 연결되는 DataSet

- `timelineState.activeArrowItemIds`  
  펼쳐진 부모 item ID 목록

- `loadedItems: Set<string>`  
  하위 tech 로드 완료된 부모 ID 집합 (중복 fetch 방지)

- `pendingRequests: Set<string>`  
  동시 API 호출 방지 락

- `store.useSubTechCache: boolean`  
  캐시 기반 재오픈 동작 제어 flag
  - `true`: 두 번째 토글부터 API 재호출 없이 재오픈
  - `false`: 접기 시 캐시 제거, 다음 열기 때 재호출

- `store.subTechCacheByParentId`  
  부모 ID별 child tech 캐시 저장소

- `timelineArrows`  
  `VisTimelineArrows` 인스턴스. child 추가/삭제 시 선 동기화

### 4) 주요 함수 흐름 맵

- `Timeline.vue`
  - `onMounted` → `loadItems` → `new Timeline(...)` → `setInstance`
  - 클릭 이벤트 → `onContainerClick`

- `useTimeline.ts`
  - `onContainerClick` → `visibleSubTechTree`
  - `visibleSubTechTree(true)` → `loadSubTechItems`
  - `loadSubTechItems`
    - cache hit: `restoreCachedSubTechItems`
    - cache miss: `store.getTrms` → `itemsDS.add` → `store.cacheSubTechItems` → `syncArrowForParent`
  - `visibleSubTechTree(false)` → `removeSubItems` + `removeArrowForParent`

- `timeline.store.ts`
  - `loadItems`: PRM 부모 로딩 + 그룹 파생 생성
  - `getTrms`: TRM child API 응답을 timeline item 형태로 변환
  - `setSubTechCacheEnabled`: 캐시 모드 ON/OFF 전환

### 5) 30 Mar 운영 업데이트 (Popup + 이벤트 분리)

#### 5-1. 오늘 요청 반영 요약

- `workspaceNew/Timeline.vue`에 누락되어 있던 상세 layer Popup 기능을 재가공해 이식
- Popup을 **아이템 hover 시 표시**, **아이템에서 벗어나면 숨김**으로 동작하도록 적용
- 아이템 클릭 시 **Popup 고정(pinned)** 유지 동작 적용
- Popup 전용 UI를 **새 컴포넌트 파일로 분리**
  - `src/domains/timeline/components/Roadmap/workspaceNew/ItemHoverLayerPopup.vue`
- 이벤트 핸들러 로직을 hook(composable)으로 분리해 `Timeline.vue`를 경량화
  - `src/domains/timeline/components/Roadmap/workspaceNew/useTimelineHoverPopup.ts`

#### 5-2. Popup 동작 설명 (현재 반영된 UX)

##### A. 기본 hover 동작

1. 마우스가 아이템 위로 올라가면(`itemover`) Popup 표시
2. Popup 위치는 마우스 좌표 기준으로 계산
3. 화면 경계를 넘어가지 않도록 좌표 보정

##### B. 아이템 이탈 시 동작

1. 아이템에서 마우스가 벗어나면(`itemout`) 즉시 닫지 않고 짧은 지연 후 닫기
2. 이 지연 시간 동안 마우스가 Popup 영역으로 이동하면 Popup 유지
3. Popup 위에서도 벗어나면(leave) 닫힘(단, 고정 상태 제외)

##### C. 클릭 고정(pinned) 동작

1. 아이템 클릭 시 Popup을 pinned 상태로 전환
2. pinned 상태에서는 hover out이 발생해도 Popup 유지
3. 아래 조건에서 pinned 해제 및 Popup 닫힘
   - Popup 닫기 버튼 클릭
   - Popup/아이템 외부 영역 클릭
   - `ESC` 입력

##### D. 상세 열기

- Popup의 `상세 보기` 클릭 시 `open-detail-slide` 이벤트 emit
- 부모 페이지 상세 패널(또는 상세 슬라이드)로 연결 가능

#### 5-3. 이벤트 분리 후 역할 경계

- `Timeline.vue`
  - timeline 인스턴스 생성/렌더 연결
  - hook 반환 상태를 Popup 컴포넌트에 바인딩
  - mounted/unmounted에서 timeline 이벤트 연결 및 해제

- `useTimelineHoverPopup.ts`
  - Popup 상태(`show`, `pinned`, `hoveringPopup`) 관리
  - timeline 이벤트 핸들러(`itemover`, `itemout`, `click`) 제공
  - 전역 이벤트(`mousedown`, `keydown`) 등록/해제 제공

- `ItemHoverLayerPopup.vue`
  - Popup UI 렌더링 전담
  - `close`, `openDetail`, `enter`, `leave` 이벤트 emit
