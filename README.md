# my-vue

Vue 3 + TypeScript + Vite 기반의 Timeline 프로젝트입니다.

## 프로젝트 구조

```
my-vue/
├── src/                 # 프론트엔드 소스
│   ├── domains/
│   │   └── timeline/   # Timeline 도메인 로직
│   ├── pages/          # 페이지 컴포넌트
│   ├── router/         # Vue Router 설정
│   └── shared/         # 공유 유틸리티
└── server/             # 백엔드 서버 (Node.js + Express)
    ├── src/
    │   ├── index.js    # 서버 진입점
    │   ├── data/       # Mock 데이터
    │   └── routes/     # API 라우터
    └── package.json
```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

### 1. 프론트엔드 설치

```sh
npm install
```

### 2. 백엔드 서버 설치

```sh
cd server
npm install
cd ..
```

### 3. 개발 환경 설정

`.env.development` 파일이 자동으로 생성되어 있습니다:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Development

### 프론트엔드와 백엔드 동시 실행 (권장)

```sh
npm install -D concurrently  # 처음 한 번만 실행
npm run dev:all
```

이 명령어는 다음을 동시에 실행합니다:
- 백엔드 서버: http://localhost:3001
- 프론트엔드: http://localhost:5173

### 개별 실행

#### 프론트엔드만 실행

```sh
npm run dev
```

#### 백엔드 서버만 실행

```sh
npm run dev:server
```

또는

```sh
cd server
npm run dev
```

## API 서버

백엔드 서버는 `http://localhost:3001`에서 실행되며 다음 엔드포인트를 제공합니다:

### Tree API
- `GET /api/tree/roots` - 루트 노드 조회
- `GET /api/tree/:nodeId/children` - 자식 노드 조회
- `GET /api/tree/:nodeId` - 특정 노드 조회

### Items API
- `GET /api/items/all` - 모든 아이템 조회
- `GET /api/items/group/:groupId` - 특정 그룹의 아이템 조회
- `GET /api/items/:itemId` - 특정 아이템 조회

자세한 내용은 [server/README.md](server/README.md)를 참조하세요.

## Production Build

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Testing

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

## Code Quality

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io/)

```sh
npm run format
```

## Features

### Timeline View
- 4-depth 트리 구조의 그룹 관리
- vis-timeline 기반 타임라인 뷰
- 아이템 클릭 시 확대/포커스 기능
- 마우스 오버 상세 정보 팝업
- 그룹별 펼치기/접기
- 실시간 데이터 연동

### Architecture
- Vue 3 Composition API
- TypeScript
- Pinia 상태 관리
- Express.js 백엔드
- RESTful API
- Component-based 구조

---

## /roadmap 페이지 구조 상세

### 개요

`/roadmap` 라우트는 vis-timeline 기반의 인터랙티브 로드맵 화면으로,  
프로젝트 작업(Task)의 일정·상태·우선순위를 타임라인 형태로 시각화하고,  
필터링 및 선택한 항목의 상세 정보 조회 기능을 제공합니다.

---

### 라우터 설정

```typescript
// src/router/index.ts
{
  path: '/roadmap',
  name: 'roadmap',
  component: RoadmapView,   // src/pages/RoadmapView.vue
}
```

---

### 컴포넌트 계층 구조

```
RoadmapView.vue                          (페이지 진입점)
├── RoadmapHeaderSection.vue             (헤더 + 요약 카드)
├── RoadmapFilterPanel.vue               (필터 패널)
├── TimelineRoadmap.vue                  (타임라인 메인 영역)
│   └── TimelineView.vue                 (vis-timeline 래퍼)
└── RoadmapDetailsPanel.vue              (선택 항목 상세 패널)
```

---

### 컴포넌트 상세

#### 1. `RoadmapView.vue` — 페이지 진입점
**경로**: `src/pages/RoadmapView.vue`

- `useRoadmapViewModel()` composable을 통해 모든 상태·액션을 주입받음
- `onMounted` 시 `initialize({ bindAllOnMount: true })` 호출로 초기 데이터 로드
- 로딩/에러 상태에 따라 피드백 문구를 표시하고, 정상 데이터 로드 후 `content-grid` 레이아웃 렌더링

| 영역 | 담당 컴포넌트 |
|------|--------------|
| 헤더 + 요약 | `RoadmapHeaderSection` |
| 필터 컨트롤 | `RoadmapFilterPanel` |
| 타임라인 | `TimelineRoadmap` |
| 상세 패널 | `RoadmapDetailsPanel` |

---

#### 2. `RoadmapHeaderSection.vue` — 헤더 & 요약 카드
**경로**: `src/domains/timeline/components/roadmap-page/RoadmapHeaderSection.vue`

**Props**
| Prop | 타입 | 설명 |
|------|------|------|
| `summaryCards` | `SummaryCard[]` | 요약 통계 카드 배열 |

**Emits**
| 이벤트 | 설명 |
|--------|------|
| `reset` | 필터 초기화 버튼 클릭 시 발생 |

**기능**
- 페이지 타이틀 및 설명 표시
- 4개의 요약 카드 표시: **전체 작업 / 현재 표시 / 진행 중 / 완료**
- 각 카드는 `tone` 속성(`slate`, `blue`, `indigo`, `green`)으로 색상 구분
- "필터 초기화" 버튼으로 `reset` 이벤트 발생

---

#### 3. `RoadmapFilterPanel.vue` — 필터 패널
**경로**: `src/domains/timeline/components/roadmap-page/RoadmapFilterPanel.vue`

**Props**
| Prop | 타입 | 설명 |
|------|------|------|
| `searchText` | `string` | 키워드 검색어 |
| `selectedGroupId` | `string` | 선택된 그룹 ID (`'all'` 또는 그룹 ID 문자열) |
| `statusFilter` | `StatusFilter` | 상태 필터 (`all` \| `planning` \| `in-progress` \| `completed` \| `on-hold`) |
| `priorityFilter` | `PriorityFilter` | 우선순위 필터 (`all` \| `low` \| `medium` \| `high` \| `critical`) |
| `hideCompleted` | `boolean` | 완료 항목 숨기기 여부 |
| `bindAllOnMount` | `boolean` | 전체 트리 데이터 바인딩 여부 |
| `groupOptions` | `SelectOption[]` | 그룹 선택 옵션 목록 |

**Emits** (모두 `update:*` 패턴의 단방향 바인딩)
- `update:searchText`, `update:selectedGroupId`, `update:statusFilter`
- `update:priorityFilter`, `update:hideCompleted`, `update:bindAllOnMount`

**기능**
- 키워드 검색 (`<input type="text">`)
- 그룹별 필터 (`<select>`, 동적 옵션)
- 상태별 필터 (`<select>`)
- 우선순위별 필터 (`<select>`)
- 완료 항목 숨기기 체크박스
- 전체 데이터 바인딩 모드 토글 (체크 해제 시 루트 노드만 로드)

---

#### 4. `TimelineRoadmap.vue` — 타임라인 메인 영역
**경로**: `src/domains/timeline/components/Roadmap/TimelineRoadmap.vue`

**Props**
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `items` | `TimelineItem[]` | — | 타임라인 아이템 배열 |
| `groups` | `TimelineGroup[]` | — | 타임라인 그룹 배열 |
| `viewMode` | `'month' \| 'quarter'` | `'month'` | 시간 축 스케일 |
| `selectedItemId` | `string \| null` | `null` | 선택된 아이템 ID |

**Emits**
| 이벤트 | 설명 |
|--------|------|
| `update:viewMode` | 뷰 모드 변경 |
| `select-item` | 아이템 선택 시 (itemId 전달) |
| `clear-selection` | 선택 해제 |

**주요 기능**
- 툴바: **Today** (현재 날짜 이동) / **Fit** (전체 보기) / **Zoom In·Out** / **뷰 모드 토글**
- `viewMode`가 변경되면 `applyViewMode()`로 vis-timeline 옵션(timeAxis scale·step, 윈도우 범위) 자동 갱신
- `selectedItemId` 변경 시 해당 아이템으로 포커스 이동 및 선택 처리
- 내부적으로 `TimelineView.vue`를 `ref`로 참조하여 vis-timeline API에 직접 접근

---

#### 5. `TimelineView.vue` — vis-timeline 래퍼
**경로**: `src/domains/timeline/components/TimelineView.vue`

**Props**
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `items` | `TimelineItem[]` | — | 렌더링할 타임라인 아이템 |
| `groups` | `TimelineGroup[]` | `undefined` | 렌더링할 그룹 |
| `themeClass` | `string` | `'timeline-default'` | 루트 엘리먼트 CSS 클래스 |

**Emits**
| 이벤트 | 설명 |
|--------|------|
| `itemHover` | 아이템 마우스 오버 (itemId, x, y) |
| `itemClick` | 아이템 클릭 (itemId) |
| `groupClick` | 그룹 레이블 클릭 (groupId) |

**기능**
- vis-timeline 라이브러리를 직접 마운트·정리 (`onMounted` / `onBeforeUnmount`)
- `useTimeline()` composable을 통해 타임라인 인스턴스 생성 및 이벤트 등록
- `items`, `groups` prop 변경 시 `watch`로 타임라인 데이터셋 업데이트
- `getApi()` 메서드로 vis-timeline 인스턴스를 부모에 노출

---

#### 6. `RoadmapDetailsPanel.vue` — 선택 항목 상세 패널
**경로**: `src/domains/timeline/components/roadmap-page/RoadmapDetailsPanel.vue`

**Props**
| Prop | 타입 | 설명 |
|------|------|------|
| `selectedTaskDetail` | `unknown \| null` | 선택된 작업 원본 데이터 객체 |
| `selectedTaskDetailHtml` | `string \| null` | 렌더링용 HTML 문자열 |

**Emits**
| 이벤트 | 설명 |
|--------|------|
| `clear` | 선택 해제 버튼 클릭 시 발생 |

**기능**
- 타임라인에서 아이템 선택 시 오른쪽 사이드 패널에 HTML 상세 정보 렌더링 (`v-html`)
- 선택된 항목이 없으면 빈 상태(Empty State) 안내 문구 표시
- "선택 해제" 버튼으로 `clear` 이벤트 발생

---

### Composable 계층

```
useRoadmapViewModel()                     (RoadmapView 전용 ViewModel)
└── useTimelineProjectData()              (API 호출 + 데이터 변환 + 상태 관리)
    ├── fetchTimelineProject()            (timeline.api.ts)
    │   ├── fetchAllTreeNodes()  /  fetchRootNodes()   (tree.api.ts)
    │   └── fetchAllItems()                            (items.api.ts)
    └── fetchTaskDetails(itemId)          (timeline.api.ts → items.api.ts)
```

#### `useRoadmapViewModel`
**경로**: `src/domains/timeline/composables/useRoadmapViewModel.ts`

| 상태 | 타입 | 설명 |
|------|------|------|
| `searchText` | `Ref<string>` | 키워드 검색어 |
| `selectedGroupId` | `Ref<string>` | 선택 그룹 ID |
| `statusFilter` | `Ref<StatusFilter>` | 상태 필터 값 |
| `priorityFilter` | `Ref<PriorityFilter>` | 우선순위 필터 값 |
| `hideCompleted` | `Ref<boolean>` | 완료 항목 숨김 여부 |
| `viewMode` | `Ref<'month' \| 'quarter'>` | 타임라인 뷰 모드 |
| `activeItemId` | `Ref<string \| null>` | 선택된 아이템 ID |
| `bindAllOnMount` | `Ref<boolean>` | 전체 트리 로드 여부 |
| `filteredItems` | `ComputedRef<TimelineItem[]>` | 필터 적용된 아이템 |
| `filteredGroups` | `ComputedRef<TimelineGroup[]>` | 필터 적용된 그룹 (부모 그룹도 유지) |
| `summaryCards` | `ComputedRef<SummaryCard[]>` | 요약 카드 데이터 |
| `groupOptions` | `ComputedRef<SelectOption[]>` | 그룹 선택 옵션 |

| 액션 | 설명 |
|------|------|
| `initialize(options)` | 초기 데이터 로드 (`bindAllOnMount` 옵션 적용) |
| `resetFilters()` | 모든 필터 초기화 |
| `selectRoadmapItem(itemId)` | 아이템 선택 + 상세 정보 로드 |
| `clearRoadmapSelection()` | 아이템 선택 해제 |
| `setBindAllOnMount(value)` | 바인딩 모드 변경 후 데이터 재로드 |

**필터 computed 로직**  
`filteredItems`는 키워드(`searchText`), 그룹(`selectedGroupId`), 상태(`statusFilter`), 우선순위(`priorityFilter`), 완료 숨김(`hideCompleted`) 조건을 모두 AND 연산으로 적용합니다.  
`filteredGroups`는 필터링된 아이템에 속한 그룹 및 그 **조상 그룹**을 모두 포함시켜 트리 구조가 유지되도록 처리합니다.

---

#### `useTimelineProjectData`
**경로**: `src/domains/timeline/composables/useTimelineProjectData.ts`

- `loadProject(options)`: API에서 그룹(트리 노드)·아이템을 병렬 로드 후 `dataTransformer`로 변환
- `selectTask(taskId)`: 특정 아이템 상세 정보 조회 후 HTML로 변환
- `clearSelection()`: 선택 상태 초기화
- `getProgressStats()`: 상태별 카운트 집계 반환 (`completed`, `inProgress`, `planning`, `onHold`)

---

### API 레이어

**경로**: `src/domains/timeline/api/`

| 파일 | 함수 | 엔드포인트 | 설명 |
|------|------|-----------|------|
| `timeline.api.ts` | `fetchTimelineProject()` | 병렬 호출 | 그룹·아이템 동시 조회 |
| `timeline.api.ts` | `fetchTaskDetails(itemId)` | `GET /api/items/:itemId` | 아이템 상세 조회 |
| `tree.api.ts` | `fetchAllTreeNodes()` | `GET /api/tree` | 전체 트리 노드 조회 |
| `tree.api.ts` | `fetchRootNodes()` | `GET /api/tree/roots` | 루트 노드만 조회 |
| `items.api.ts` | `fetchAllItems()` | `GET /api/items/all` | 전체 아이템 조회 |
| `items.api.ts` | `fetchItemById(id)` | `GET /api/items/:itemId` | 단일 아이템 조회 |

---

### 데이터 변환 (`dataTransformer.ts`)

**경로**: `src/domains/timeline/utils/dataTransformer.ts`

| 함수 | 입력 → 출력 | 설명 |
|------|------------|------|
| `transformBackendProjectToTimeline()` | `TreeNodeData[], ItemCard[]` → `TransformedTimelineData` | 백엔드 응답을 vis-timeline 형식으로 변환 |
| `transformTaskToTimelineItem()` | `ProjectTask` → `TimelineItem` | 작업을 타임라인 아이템으로 변환 (HTML content 포함) |
| `transformGroupToTimelineGroup()` | `ProjectGroup` → `TimelineGroup` | 그룹 데이터 변환 |
| `transformBackendItemToTaskDetailHtml()` | `ItemCard` → `string` | 아이템 상세 정보를 HTML 문자열로 변환 |

**Status 색상 매핑**

| 상태 | 색상 |
|------|------|
| `planning` | `#f59e0b` (황색) |
| `in-progress` | `#3b82f6` (청색) |
| `completed` | `#10b981` (녹색) |
| `on-hold` | `#ef4444` (적색) |

**Priority 이모지 매핑**: `low 🟢` / `medium 🟡` / `high 🟠` / `critical 🔴`

---

### 타입 정의

**경로**: `src/domains/timeline/types/`

```typescript
// index.ts / item.types.ts / tree.types.ts

interface TimelineItem {
  id: string | number
  content: string
  start: string | Date
  end?: string | Date
  group?: string | number
  className?: string   // 'status-{status} priority-{priority}' 형태
  title?: string
  type?: string
}

interface ItemCard {
  id: string
  title: string
  description: string
  start: string
  end: string
  groupId: string | number
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  assignee: string
  imageUrl: string
}

interface TreeNodeData {
  id: string | number
  content: string
  parent?: string | number
  // ... 기타 트리 속성
}

// useRoadmapViewModel에서 정의
type StatusFilter = 'all' | 'planning' | 'in-progress' | 'completed' | 'on-hold'
type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical'
type ViewMode = 'month' | 'quarter'

interface SummaryCard {
  label: string
  value: number
  tone: 'slate' | 'blue' | 'indigo' | 'green'
}
```

---

### 데이터 흐름 요약

```
[브라우저 /roadmap 접근]
        │
        ▼
RoadmapView.vue
  onMounted → initialize({ bindAllOnMount: true })
        │
        ▼
useRoadmapViewModel
  → useTimelineProjectData.loadProject()
        │
        ├── fetchAllTreeNodes()  →  GET /api/tree         (groups)
        └── fetchAllItems()      →  GET /api/items/all    (tasks)
                │
                ▼
        dataTransformer
          transformBackendProjectToTimeline()
                │
                ▼
        items (Ref), groups (Ref)
                │
        ┌───────┴────────┐
        │                │
  filteredItems     filteredGroups   ← 필터 computed
  (computed)        (computed)
        │
        ▼
TimelineRoadmap.vue  →  TimelineView.vue  →  vis-timeline 렌더링
        │
        │ 아이템 클릭 (select-item)
        ▼
useRoadmapViewModel.selectRoadmapItem(itemId)
  → fetchTaskDetails(itemId)  →  GET /api/items/:itemId
  → transformBackendItemToTaskDetailHtml()
        │
        ▼
RoadmapDetailsPanel.vue  (v-html 렌더링)
```
