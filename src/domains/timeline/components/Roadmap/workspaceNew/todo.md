# workspaceNew TODO

최종 갱신: 2026-03-30

이 문서는 workspaceNew 전용 작업만 관리합니다.
legacy workspace 관련 내용은 ../workspace/todo.md 에서 관리합니다.

## 1) 현재 상태 요약

- 타임라인 기본 렌더링 및 DataSet 기반 구조 적용 완료
- 부모 item 기준 +/- 하위 항목 토글 완료
- 하위 항목 캐시 및 arrow 동기화 완료
- Hover Popup 분리 컴포넌트 및 composable 적용 완료
- API 인터페이스 확장(fetchDdCode, fetchOrgGroups, fetchGroups) 완료
- Group 체크박스와 items 표시/숨김 연동 완료

## 2) 완료된 항목

- [x] /roadmap-workspace-new 라우트 및 메뉴 연결
- [x] Timeline.vue + useTimeline.ts + timeline.store.ts 구조 분리
- [x] PRM 아이템 로딩 및 TRM/COM 하위 항목 lazy load
- [x] sub item 표시/숨김 시 arrow 표시/숨김 동기화
- [x] sub tech 캐시 on/off 제어
- [x] ItemHoverLayerPopup.vue 도입
- [x] useTimelineHoverPopup.ts 도입
- [x] timeline.store.ts 트리 그룹 필드 반영
  - [x] parent
  - [x] nestedGroups
  - [x] isSubGroup
  - [x] hasChildren
- [x] templates.ts isSubGroup 키 정합화
- [x] group 체크박스 클릭 시 그룹/하위그룹 item visibility 연동
- [x] vue-tsc --noEmit 기준 타입체크 통과

## 3) 진행중 항목

- [ ] Group 체크 상태와 상단 전체 토글 UI 완전 동기화
- [ ] Group 행 자체 collapse/expand UX 요구 여부 확정 및 반영

## 4) 다음 작업 후보
### 4-1) 우선 작업 후보
- [ ] A. /origin 폴더내에 구성 컴포넌트들의 종속성 구조 활용 디자인 가져오고 + /workspaceNew에서 정리된 기능을 개선된 기능으로 조합하기 (origin이 lagacy이기 때문에 모든 기능을 옮겨서 refactory 하려는 목적이다)
  - [ ] 1. TimelineGroup.vue => template.ts에 groupTemplate에 적용
  - [ ] 2. TimelineItem.vue => template.ts에 itemTemplate에 적용
  - [ ] 3. ItemInfoPopup.vue => ItemHoverLayerPopup.vue에 적용
  - [ ] 4. ItemDetailSlide.vue => RoadmapDetailsPanel.vue에 적용
  - [ ] 5. 처리한 내용을 API_INTEGRATION.md에 적용해서 갱신
  - [ ] 6. 처리한 내용으로 각 내용을 git commit
- [ ] B. timeline.store.ts 개선
  - [ ] 1. loadGroups 기능은 별도의 api가 존재하므로 연결한다: 위치 = /Roadmap에 존재하는 timeline.store.ts > loadGroups 항목과 똑같은 동작
  - [ ] 2. origin 의 디자인 기능 + workspaceNew의 개선된 기능으로 조합하여 완성
  - [ ] 3. 처리한 내용을 API_INTEGRATION.md에 적용해서 갱신
  - [ ] 4. 처리한 내용으로 각 내용을 git commit

### 4-2) 추후 작업 후보
- [ ] 그룹 체크 상태 영속화(새로고침 후 유지) 필요 여부 검토
- [ ] groupTemplate 인라인 style 제거 및 스타일 파일 분리
- [ ] 서버에 org/groups 전용 endpoint 추가 시 useTimelineApi 파생 로직 제거
- [ ] workspaceNew 전용 e2e 시나리오 추가
  - [ ] group 체크박스 on/off
  - [ ] 하위 항목 토글/캐시 재오픈
  - [ ] popup pinned/close 동작

## 5) 참고 파일

- src/domains/timeline/components/Roadmap/workspaceNew/Timeline.vue
- src/domains/timeline/components/Roadmap/workspaceNew/useTimeline.ts
- src/domains/timeline/components/Roadmap/workspaceNew/timeline.store.ts
- src/domains/timeline/components/Roadmap/workspaceNew/useTimelineApi.ts
- src/domains/timeline/components/Roadmap/workspaceNew/templates.ts
- src/domains/timeline/components/Roadmap/workspaceNew/useTimelineHoverPopup.ts
- src/domains/timeline/components/Roadmap/workspaceNew/ItemHoverLayerPopup.vue
