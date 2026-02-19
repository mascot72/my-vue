# Enhanced Timeline Feature

## 개요

Enhanced Timeline은 왼쪽에 Tree 형태의 Groups 구조와 오른쪽에 Card 형태의 Items를 표시하는 개선된 Timeline 기능입니다.

## 주요 기능

### 1. Groups Tree (왼쪽 영역)
- **4-depth Tree 구조**: 최대 4단계까지의 계층적 그룹 구조
- **동적 로딩**: 각 노드 클릭 시 자식 노드를 비동기로 로드
- **펼치기/접기**: 노드를 클릭하여 하위 구조 표시/숨김
- **리프 노드 선택**: 최하위 노드 선택 시 오른쪽에 관련 Items 표시
- **로딩 애니메이션**: 데이터 fetch 중 로딩 인디케이터 표시

### 2. Items Grid (오른쪽 영역)
- **Card 레이아웃**: 그리드 형태로 여러 아이템 카드 표시
- **반응형 그리드**: 화면 크기에 따라 자동 조정
- **다양한 정보 표시**:
  - 제목 및 설명
  - 이미지
  - 상태 (active, pending, completed, archived)
  - 우선순위 (low, medium, high, critical)
  - 태그
  - 메타데이터 (작성자, 버전, 다운로드 수 등)
  - 생성/수정 날짜

### 3. Layer Popup
- **마우스 오버 시 표시**: 아이템 카드에 마우스를 올리면 상세 정보 팝업 표시
- **마우스 아웃 시 숨김**: 마우스를 떼면 자동으로 숨김
- **상세 정보**: 아이템의 모든 메타데이터와 상세 정보 표시
- **동적 위치**: 마우스 커서 근처에 팝업 표시

## 파일 구조

```
src/domains/timeline/
├── types/
│   ├── index.ts              # 타입 통합 export
│   ├── tree.types.ts         # Tree 관련 타입
│   └── item.types.ts         # Item 관련 타입
├── api/
│   ├── tree.api.ts           # Tree 노드 데이터 fetch API
│   └── items.api.ts          # Items 데이터 fetch API
├── store/
│   ├── tree.store.ts         # Tree 상태 관리 (Pinia)
│   └── items.store.ts        # Items 상태 관리 (Pinia)
├── components/
│   ├── tree/
│   │   ├── GroupsTree.vue    # Tree 컨테이너 컴포넌트
│   │   └── TreeNodeItem.vue  # 개별 Tree 노드 컴포넌트
│   └── items/
│       ├── ItemsGrid.vue     # Items 그리드 컨테이너
│       ├── ItemCard.vue      # 개별 Item 카드 컴포넌트
│       └── LayerPopup.vue    # 마우스 오버 팝업 컴포넌트
└── ...
```

## 사용 방법

### 1. 페이지 접속
- URL: `/timeline-enhanced`
- 네비게이션 메뉴에서 "Enhanced" 클릭

### 2. Groups 탐색
1. 왼쪽 Tree에서 폴더 아이콘이 있는 노드 클릭
2. 하위 노드가 펼쳐짐
3. 최하위(리프) 노드 클릭 시 오른쪽에 Items 표시

### 3. Items 확인
1. 오른쪽 그리드에서 카드 형태로 표시된 Items 확인
2. 마우스를 카드 위로 올리면 상세 정보 팝업 표시
3. 마우스를 떼면 팝업 자동 숨김

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
  items: ItemCard[]
  selectedGroupId: string | null
  hoveredItemId: string | null
  loading: boolean
  error: string | null
  popupVisible: boolean
  
  // Actions
  loadItems(groupId)
  showPopup(itemId, x, y)
  hidePopup()
  setHoveredItem(itemId)
}
```

## 주요 기술 스택

- **Vue 3**: Composition API 사용
- **TypeScript**: 타입 안전성
- **Pinia**: 상태 관리
- **CSS**: Scoped 스타일, 반응형 디자인

## 개선 가능한 부분

1. **실제 API 연동**: 현재는 Mock 데이터 사용
2. **검색 기능**: Tree/Items 검색
3. **필터링**: 상태, 우선순위 등으로 필터링
4. **정렬**: 다양한 기준으로 정렬
5. **페이지네이션**: 많은 아이템 처리
6. **캐싱**: API 응답 캐싱으로 성능 개선
7. **에러 처리**: 더 세밀한 에러 핸들링
8. **접근성**: 키보드 네비게이션, ARIA 속성 추가
