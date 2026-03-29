visTimelineArrow.js => ts
필요기술을 보여주기 , 숨기기 처리

해결 할 과제
Timeline.vue 는 분할하였으나 , 디자인이 아직 다 안채워져서 깨져 있지만 , 속도는 빠르다
 부모폴더의 Timeline.vue는 VisTimeline.vue와 비슷한 거의 원본이다
 workspace하단에 내용은 회사에서 작업중인 버젼이다
 workspace/Timeline.vue는 리펙토링 중인 버전이다
VisTimeline.vue는 기존 기능이므로 연결 기능은 되지만 havy해서 속도가 매우 느리다
useTimelineOption.ts는 원본에서 options부분을 분할 한 버젼으로 js => ts로 변경만 했다

gemini > Vue Timeline Composable 분석: 금요일 퇴근시 받은 작업 중 백업이다
  - 최대한 원본에서 시작하여 Timeline.vue를 완성해서
  - 출근후 적용해 본다
  - 원본 로직 학습후, 굵직한 로직 정의하기
    + Options, Store, DS, group, item 처리 방식
    + Arraw처리 방식
    + 필요기술 보이기/숨기기 로직 확인
  + Refactory 하기
    - store.arrow 변수 생성
    - 타임라인 인스턴스가 생성된 직후에 VisTimelineArrows를 초기화
    - handleItemOver에서 데이터가 로드된 직후 부모와 자식을 연결하는 선을 동적으로 추가해야 합니다.

## 오늘의(29 mar) TODO
* Backend 작업 및 spec
  + 목표
    - workspace/Timeline.vue 에서 사용하는 데이터 구조와 응답을 backend mock 서버에서 동일하게 제공
    - timeline.store.ts 의 item/group 필드 매핑 기준에 맞춰 변환 가능한 원천 데이터 보장

  + 서버 구현 작업
    - [ ] Roadmap Workspace 전용 mock 데이터셋 추가
      - [ ] 제품(Product) 아이템 목록 데이터
      - [ ] 필요기술(Require Technology) 데이터
      - [ ] itemId 기반 하위 tech 매핑 데이터
    - [ ] API 라우트 추가 (server/src/routes 기준)
      - [ ] loadItems: 제품 item 조회 endpoint
      - [ ] getTechs: itemId 기반 필요기술 조회 endpoint
      - [ ] getTrm: item에 연결된 필요기술 트리/목록 조회 endpoint
    - [ ] 응답 지연(Mock delay) 및 404/empty 응답 케이스 처리

  + 프론트 매핑/변환 스펙
    - [ ] loadItems 응답을 getProductItems 로 timelineItems 형태로 변환 가능해야 함
      - 필수 필드: id, itemLink, title, content, start, end, group, className
      - 보조 필드: itemStatusCode, itemProgStatusCode, trmCount, hasTrm, roadmapType
    - [ ] getTechs/getTrm 응답을 getRequireTechnologyItems 로 timelineItems 변환 가능해야 함
      - 필수 필드: id, title, start, end, group, parentItemId
      - 보조 필드: technologyClassLv1Id~Lv3Id, comTechTypeCode, ptrmType

  + API 계약(spec)
    - [ ] Endpoint 규약 초안
      - GET /api/workspace-roadmap/items
      - GET /api/workspace-roadmap/items/:itemId/techs
      - GET /api/workspace-roadmap/items/:itemId/trm
    - [ ] Query 규약
      - roadmapType: PRM | TRM | COM
      - includeInactive: true | false (default false)
      - page, size (기본값 포함)
    - [ ] Response 규약
      - 공통: { content, page, size, totalElements }
      - 오류: { error, message, code }

  + 완료 기준(Definition of Done)
    - [ ] workspace 코드에서 API 호출 시 mock 서버 응답으로 화면 렌더링 가능
    - [ ] 제품 item 클릭 시 하위 tech 데이터 조회/표시 가능
    - [ ] 빈 데이터/없는 itemId 요청 시 오류 없이 empty-state 처리 가능
    - [ ] 최소 샘플 데이터 10개 이상(제품), 각 제품별 tech 2개 이상 준비
* frontend 작업 및 spec
  + router에 /roadmap-workspace 라고 추가 (완료)
  + 메뉴도 Work Roadmap 이라고 추가 (완료)
  + workspace에 존재하는 구성들이 동작되도록 Timeline.vue에 연결하기 (workspaceNew 기준 완료)
  + 앞의 Timeline.vue에 부모 page를 만들어서 연결하기 (완료)
  + 실행해서 동작들 확인하기 (workspaceNew 기준 진행)
    - sub items가 보이는 (아래로 붙어서 열리는) 시점은 item의 오른쪽 하단 +/- 버튼을 통해 toggle처리 한다 (완료)
    - items 의 각 item에 techs가 sub items가 붙도록 해서 부모 item의 밑에 stack구조로 쌓이게 보이도록 한다 (완료)
    - TimelineArrow로 서로 선으로 연결하여 보이도록 한다 (완료)
  + 랜더링 및 메모리 속도등 성능 개선: 둘중 적합한 방법으로 선택 (workspaceNew 기준 DataSet 적용)
    - DataSet (완료)
    - nodes ref (VUE proxy)
    + 각종 상호작용기능 원할 한지 검토
      - 전체 펼치기/접기 (완료: sub items 기준)
      - 각각 group 펼치기/접기
      - 하위 items 보이기/숨기기 (완료)
      - 하위 items와 arrow연결 보이기/숨기기 (완료)
      - item 추가하고 focus 이동하기


## 적용 결과 기록 (workspaceNew 기준)

### 1) 파일 구조 (현재 반영본)

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

### 2) 로직/개념/중요 데이터 변수 흐름

#### A. 전체 동작 개념

1. `/roadmap-workspace-new` 진입  
   → `RoadmapWorkspaceNewPage.vue` 로드  
   → 내부에서 `workspaceNew/Timeline.vue` 렌더

2. `Timeline.vue` 마운트  
   → `store.loadItems()` 호출로 PRM(부모) 아이템 조회  
   → `itemsDS`/`groupsDS` 바인딩 후 vis-timeline 생성

3. 사용자가 부모 아이템의 `+/-` 클릭  
   → `onContainerClick()`에서 `.vis-item-add`만 감지  
   → `visibleSubTechTree(true|false, parentId)` 실행

4. 펼치기(`+`) 시  
   - 캐시 ON: `restoreCachedSubTechItems()` 우선 시도 (재호출 없음)
   - 캐시 미스: `store.getTrms()` API 호출 후 child item 생성/삽입
   - child 삽입 후 `syncArrowForParent()`로 부모-자식 화살표 생성

5. 접기(`-`) 시  
   - `removeSubItems()`로 child item 제거
   - `removeArrowForParent()`로 연결선 제거
   - 캐시 OFF일 때만 `loadedItems`/캐시 삭제

#### B. 핵심 상태/변수 역할

- `store.itemsDS` / `store.groupsDS`  
  vis-timeline에 직접 연결되는 DataSet(렌더링 원본)

- `timelineState.activeArrowItemIds`  
  현재 펼쳐진 부모 item ID 목록(UI 상태 + 토글 상태 판단)

- `loadedItems: Set<string>` (`useTimeline.ts`)  
  이미 하위 tech 로드 완료된 부모 ID 집합(중복 fetch 방지)

- `pendingRequests: Set<string>` (`useTimeline.ts`)  
  동일 부모에 대한 동시 API 호출 방지 락(lock)

- `store.useSubTechCache: boolean` (`timeline.store.ts`)  
  캐시 기반 재오픈 동작 여부 제어 flag
  - `true`: 두 번째 토글부터 API 재호출 없이 빠르게 열림
  - `false`: 접기 시 캐시 제거, 다음 열기 때 API 재호출

- `store.subTechCacheByParentId` (`timeline.store.ts`)  
  부모 ID별 child tech 배열 캐시 저장소

- `timelineArrows` (`useTimeline.ts`)  
  `VisTimelineArrows` 인스턴스. child 추가/삭제 시 선 동기화

#### C. 주요 함수 흐름 맵

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

#### D. 현재 확인된 동작 결과

- `+/-` 버튼 클릭으로만 하위 tech 토글 (hover 자동동작 제거됨)
- 하위 items 표시/숨기기 + arrow 표시/숨기기 동작
- 전체 펼치기/접기 및 선택 항목 포커스 동작
- 캐시 모드에서 2회차 토글부터 재호출 없이 빠른 재오픈 동작


## 오늘의(30 Mar) 작업 기록

### 1) 오늘 요청 사항 정리

- `workspaceNew/Timeline.vue`에 누락되어 있던 상세 layer Popup 기능을 재가공해 이식
- Popup을 **아이템 hover 시 표시**, **아이템에서 벗어나면 숨김**으로 동작하도록 적용
- 아이템 클릭 시 **Popup 고정(pinned)** 유지 동작 적용
- Popup 전용 UI를 **새 컴포넌트 파일로 분리**
  - `src/domains/timeline/components/Roadmap/workspaceNew/ItemHoverLayerPopup.vue`
- 이벤트 핸들러 로직을 hook(composable)으로 분리해 `Timeline.vue`를 경량화
  - `src/domains/timeline/components/Roadmap/workspaceNew/useTimelineHoverPopup.ts`

### 2) Popup 동작 설명 (현재 반영된 UX)

#### A. 기본 hover 동작

1. 마우스가 아이템 위로 올라가면(`itemover`) Popup 표시
2. Popup 위치는 마우스 좌표 기준으로 계산
3. 화면 경계를 넘어가지 않도록 좌표 보정

#### B. 아이템 이탈 시 동작

1. 아이템에서 마우스가 벗어나면(`itemout`) 즉시 닫지 않고 짧은 지연 후 닫기
2. 이 지연 시간 동안 마우스가 Popup 영역으로 이동하면 Popup 유지
3. Popup 위에서도 벗어나면(leave) 닫힘(단, 고정 상태 제외)

#### C. 클릭 고정(pinned) 동작

1. 아이템 클릭 시 Popup을 pinned 상태로 전환
2. pinned 상태에서는 hover out이 발생해도 Popup 유지
3. 아래 조건에서 pinned 해제 및 Popup 닫힘
   - Popup 닫기 버튼 클릭
   - Popup/아이템 외부 영역 클릭
   - `ESC` 입력

#### D. 상세 열기

- Popup의 `상세 보기` 클릭 시 `open-detail-slide` 이벤트 emit
- 부모 페이지 상세 패널(또는 상세 슬라이드)로 연결 가능

### 3) 이벤트 분리 후 역할 경계

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


