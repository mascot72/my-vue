# Enhanced Timeline Feature

## 개요

Enhanced Timeline은 왼쪽에 Tree 형태의 Groups 구조와 오른쪽에 vis-timeline 기반의 Timeline View로 Items를 시간축에 표시하는 개선된 Timeline 기능입니다.

## 주요 기능

### 1. Groups Tree (왼쪽 영역)
- **4-depth Tree 구조**: 최대 4단계까지의 계층적 그룹 구조
- **모든 depth에서 leaf 노드 가능**: 각 depth 레벨에서 아이템을 가질 수 있음
- **동적 로딩**: 각 노드 클릭 시 자식 노드를 비동기로 로드
- **펼치기/접기**: 노드를 클릭하여 하위 구조 표시/숨김
- **리프 노드 선택**: 최하위 노드 선택 시 오른쪽에 관련 Items 표시
- **로딩 애니메이션**: 데이터 fetch 중 로딩 인디케이터 표시

### 2. Timeline View (오른쪽 영역) - vis-timeline 기반
- **시간축 표시**: 6개월 범위 (현재 기준 ±3개월)
- **주간 격자**: 매주 단위로 격자선 표시
- **시간 레이블**: 년/월/주 레이블 표시
- **카드 형태 아이템**:
  - 썸네일 이미지 (120x120px)
  - 제목, 설명
  - 상태 배지 (active, pending, completed, archived)
  - 우선순위 배지 (low, medium, high, critical)
  - 태그 (최대 3개)
  - 날짜 범위 표시
- **시간 기반 배치**: start/end 날짜에 따라 타임라인에 자동 배치
- **상태별 색상 구분**: 왼쪽 border로 상태 표시
- **우선순위별 효과**: critical 우선순위는 shadow 효과

### 3. Layer Popup
- **마우스 오버 시 표시**: 타임라인 카드에 마우스를 올리면 상세 정보 팝업 표시
- **마우스 아웃 시 숨김**: 마우스를 떼면 자동으로 숨김
- **상세 정보 표시**:
  - 제목 및 전체 설명
  - 상태 및 우선순위
  - 메타데이터 (작성자, 버전, 다운로드 수 등)
  - 생성/수정 날짜
  - 모든 태그
- **동적 위치**: 마우스 커서 근처에 팝업 표시

## 파일 구조

```
src/domains/timeline/
├── types/
│   ├── index.ts              # 타입 통합 export
│   ├── tree.types.ts         # Tree 관련 타입
│   └── item.types.ts         # Item 관련 타입 (start/end 날짜 포함)
├── api/
│   ├── tree.api.ts           # Tree 노드 데이터 fetch API
│   └── items.api.ts          # Items 데이터 fetch API (43+ items)
├── store/
│   ├── tree.store.ts         # Tree 상태 관리 (Pinia)
│   └── items.store.ts        # Items 상태 관리 (Pinia)
├── composables/
│   ├── useTimeline.ts        # vis-timeline 설정 및 API
│   ├── useItemsTimeline.ts   # ItemCard를 TimelineItem으로 변환
│   └── useTimelineProjectData.ts  # 프로젝트 데이터 통합 (예제용)
├── components/
│   ├── tree/
│   │   ├── GroupsTree.vue    # Tree 컨테이너 컴포넌트
│   │   └── TreeNodeItem.vue  # 개별 Tree 노드 컴포넌트
│   ├── items/
│   │   └── LayerPopup.vue    # 마우스 오버 팝업 컴포넌트
│   └── TimelineView.vue      # vis-timeline 기반 Timeline 컴포넌트
├── styles/
│   └── timeline.css          # Timeline 카드 및 vis-timeline 커스텀 스타일
└── ...
```

## 기술 스택

### 핵심 라이브러리
- **vis-timeline**: 타임라인 시각화 라이브러리
  - Template 함수로 HTML 카드 렌더링
  - GroupTemplate 함수로 그룹 레이블 커스터마이징
  - 시간 기반 아이템 배치
  - 그룹별 아이템 분류 및 표시
  - 이벤트 핸들링 (itemover, itemout)
- **Vue 3**: Composition API 사용
- **TypeScript**: 타입 안전성
- **Pinia**: 상태 관리

## 사용 방법

### 1. 페이지 접속
- URL: `/timeline-enhanced`
- 네비게이션 메뉴에서 "Enhanced" 클릭

### 2. Groups 탐색
1. 왼쪽 Tree에서 폴더 아이콘이 있는 노드 클릭
2. 하위 노드가 펼쳐짐
3. 리프 노드 클릭 시 오른쪽 Timeline View에 Items 표시

### 3. Timeline Items 확인
1. 오른쪽 Timeline View에서 시간축에 배치된 카드 확인
2. 카드는 start/end 날짜에 따라 자동으로 배치됨
3. 마우스를 카드 위로 올리면 상세 정보 팝업 표시
4. 마우스를 떼면 팝업 자동 숨김
5. Ctrl + 마우스 휠로 줌 인/아웃 가능
6. 드래그로 타임라인 이동 가능

### 4. TimelineView 컴포넌트 사용
```vue
<template>
  <TimelineView 
    :items="timelineItems" 
    :groups="timelineGroups"
    @item-hover="handleItemHover" 
  />
</template>

<script setup lang="ts">
// Groups 데이터 형식
const timelineGroups = [
  { 
    id: 'group1', 
    content: '<div class="group-label-text" data-level="1">Level 1 Group</div>',
    level: 1 
  },
  { 
    id: 'group2', 
    content: 'Level 2 Group',
    level: 2 
  }
]

// Items 데이터에 group 속성 추가
const timelineItems = [
  {
    id: 1,
    group: 'group1',  // 그룹 ID 지정
    start: '2026-02-01',
    end: '2026-02-10',
    content: '<div class="timeline-card">...</div>'
  }
]
</script>
```

## API 구조

### Tree API
```typescript
// 루트 노드 조회
fetchRootNodes(): Promise<TreeNodeData[]>

// 특정 부모의 자식 노드 조회
fetchChildNodes(parentId: string): Promise<TreeNodeData[]>

// 특정 노드 정보 조회
fetchNodeById(nodeId: string): Promise<TreeNodeData | null>
```

### Items API
```typescript
// 특정 그룹의 아이템들 조회
fetchItemsByGroupId(groupId: string): Promise<ItemCard[]>

// 특정 아이템 상세 정보 조회
fetchItemById(itemId: string): Promise<ItemCard | null>
```

## Store 구조

### Tree Store
```typescript
{
  // State
  nodes: Map<string, TreeNode>
  expandedNodeIds: Set<string>
  selectedNodeId: string | null
  loading: boolean
  error: string | null
  
  // Actions
  loadRootNodes()
  loadChildren(parentId)
  toggleNode(nodeId)
  selectNode(nodeId)
  clearSelection()
}
```

### Items Store
```typescript
{
  // State
  items: ItemCard[]  // start/end 날짜 포함
  selectedGroupId: string | null
  loading: boolean
  error: string | null
  
  // Actions
  loadItems(groupId)
  clearItems()
}
```

## vis-timeline 설정

### Timeline 옵션
```typescript
{
  stack: true,              // 아이템 겹침 방지
  zoomKey: 'ctrlKey',       // Ctrl + 휠로 줌
  start: -3개월,            // 시작 시간
  end: +3개월,              // 종료 시간  
  orientation: 'top',       // 시간축 위쪽
  showCurrentTime: true,    // 현재 시간 라인 표시
  timeAxis: {
    scale: 'week',          // 주 단위
    step: 1                 // 매주
  },
  format: {
    minorLabels: { week: 'w주' },
    majorLabels: { month: 'YYYY년 M월' }
  },
  template: (item) => {     // 아이템 HTML 렌더링
    // ItemCard HTML을 DOM 요소로 변환
  },
  groupTemplate: (group) => {  // 그룹 레이블 HTML 렌더링
    // Tree 노드를 그룹 레이블로 변환
    // level/depth에 따라 스타일 차별화
  }
}
```

### Timeline 카드 구조
```html
<div class="timeline-card">
  <div class="timeline-thumbnail">
    <!-- 썸네일 이미지 또는 플레이스홀더 SVG -->
  </div>
  <div class="timeline-card-content">
    <div class="timeline-card-header">
      <h4 class="timeline-card-title">제목</h4>
      <div class="timeline-card-meta">
        <span class="timeline-status">상태</span>
        <span class="timeline-priority">우선순위</span>
      </div>
    </div>
    <p class="timeline-card-description">설명</p>
    <div class="timeline-card-tags">태그들</div>
    <div class="timeline-card-footer">
      <span class="timeline-date">날짜 범위</span>
    </div>
  </div>
</div>
```

### Timeline 그룹 레이블 구조
```html
<div class="timeline-group-label">
  <div class="group-label-text" data-level="1">
    그룹 이름
  </div>
</div>
```

**그룹 레이블 스타일링**:
- **Level 1**: 굵은 폰트 (700), 큰 사이즈, 진한 색상
- **Level 2**: 중간 굵기 (600), 0.5rem 왼쪽 패딩
- **Level 3**: 일반 굵기 (500), 1rem 왼쪽 패딩, 작은 폰트
- **Level 4**: 일반 굵기 (500), 1.5rem 왼쪽 패딩, 작은 폰트

## 레이아웃 최적화

### 전체 화면 활용
- **App.vue**: `max-width: 1280px` 제거, 전체 너비 사용
- **main.css**: padding 제거, width: 100% 설정
- **base.css**: body margin/padding 제거
- **Grid 레이아웃**: `min-width: 0`으로 flex/grid 아이템이 축소 가능하도록 설정

### 영역 구성
- **Groups Tree**: 280px 고정 너비
- **Timeline View**: 나머지 영역 전체 사용 (`1fr`)
- **Scroll**: 각 영역 독립적으로 스크롤 가능

## 최근 업데이트

### 2026-02-23: groupTemplate 기능 추가

#### 1. vis-timeline 그룹 렌더링
- **groupTemplate 함수 구현**: Tree 노드를 Timeline 그룹 레이블로 렌더링
- **HTML 기반 렌더링**: content 속성이 있으면 HTML로 파싱하여 표시
- **Depth별 스타일링**: data-level 속성으로 계층 구조 시각화
- **useTimeline.ts 개선**: groups 파라미터 추가 (옵셔널)

#### 2. TimelineView 컴포넌트 개선
- **groups prop 추가**: TimelineGroup[] 타입 지원
- **groups watch 추가**: 그룹 데이터 변경 시 자동 업데이트
- **변수명 충돌 해결**: properties → eventProps로 변경

#### 3. 그룹 레이블 스타일
- **depth별 차별화**: level 1~4에 따라 폰트 크기, 굵기, 패딩 조정
- **시각적 계층**: 왼쪽 패딩으로 들여쓰기 효과
- **hover 효과**: 그룹 레이블에 마우스 오버 시 배경색 변경
- **timeline.css 추가**: `.timeline-group-label`, `.group-label-text` 스타일

### 2026-02-19: vis-timeline 통합

#### 1. vis-timeline 통합
- ItemsGrid와 ItemCard 컴포넌트 제거
- vis-timeline 기반 TimelineView로 대체
- template 함수로 HTML 카드 렌더링 구현

#### 2. 카드 디자인
- 120px 높이의 컴팩트한 카드
- 썸네일 이미지 (120x120px)
- 상태/우선순위 배지
- 태그 표시 (최대 3개)
- 날짜 범위 표시

#### 3. 마우스 오버 팝업
- TimelineView에서 itemover/itemout 이벤트 처리
- LayerPopup 컴포넌트 연동
- 상세 정보 표시

#### 4. 레이아웃 개선
- 전체 화면 너비 활용
- min-width: 0으로 Grid 레이아웃 최적화
- Groups Tree 너비 축소 (320px → 280px)

#### 5. 파일 정리
- ItemCard.vue 삭제
- ItemsGrid.vue 삭제
- timeline.css에 모든 스타일 통합

## 개선 가능한 부분

1. **실제 API 연동**: 현재는 Mock 데이터 사용
2. **검색 기능**: Tree/Items 검색
3. **필터링**: 상태, 우선순위, 날짜 범위로 필터링
4. **정렬**: 다양한 기준으로 정렬
5. **페이지네이션**: 많은 아이템 처리
6. **캐싱**: API 응답 캐싱으로 성능 개선
7. **에러 처리**: 더 세밀한 에러 핸들링
8. **접근성**: 키보드 네비게이션, ARIA 속성 추가
9. **그룹 확장/축소**: Timeline 그룹을 펼치고 접을 수 있는 기능
10. **커스텀 시간 범위**: 사용자가 시간 범위 설정 가능
11. **드래그 앤 드롭**: 아이템을 다른 그룹으로 이동
12. **아이템 편집**: 인라인 편집 또는 모달 편집 기능
