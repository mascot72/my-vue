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
  + router에 /roadmap-workspace 라고 추가
  + 메뉴도 Work Roadmap 이라고 추가
  + workspace에 존재하는 구성들이 동작되도록 Timeline.vue에 연결하기
  + 앞의 Timline.vue에 부모 page를 만들어서 연결하기
  + 실행해서 동작들 확인하기
    - sub items가 보이는 (아래로 붙어서 열리는) 시점은 item의 오른쪽 하단 +/- 버튼을 통해 toggle처리 한다
    - items 의 각 item에 techs가 sub items가 붙도록 해서 부모 item의 밑에 stack구조로 쌓이게 보이도록 한다
    - TimelineArrow로 서로 선으로 연결하여 보이도록 한다
  + 랜더링 및 메모리 속도등 성능 개선: 둘중 적합한 방법으로 선택
    - DataSet
    - nodes ref (VUE proxy)
    + 각종 상호작용기능 원할 한지 검토
      - 전체 펼치기/접기
      - 각각 group 펼치기/접기
      - 하위 items 보이기/숨기기
      - 하위 items와 arrow연결 보이기/숨기기
      - item 추가하고 focus 이동하기


