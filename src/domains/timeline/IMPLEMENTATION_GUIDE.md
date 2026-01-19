# API 연계 Timeline 시스템 - 구현 완료 가이드

## 🎯 구현 완료 항목

### ✅ 1. 데이터 모델 정의

- **파일**: [src/domains/timeline/types.ts](types.ts)
- **내용**:
  - `ProjectGroup` - 팀/그룹 정보
  - `ProjectTask` - 프로젝트 작업 (이미지, 상태, 우선순위 포함)
  - `TimelineItem` - Timeline 렌더링용
  - `TransformedTimelineData` - 변환된 데이터

### ✅ 2. Mock API 구현

- **파일**: [src/domains/timeline/api/timeline.api.ts](api/timeline.api.ts)
- **함수**:
  - `fetchTimelineProject()` - 전체 프로젝트 데이터 조회
  - `fetchTaskDetails(taskId)` - 개별 작업 상세 조회
- **특징**:
  - 실제 API처럼 500ms 지연 포함
  - 3개 팀, 9개 작업 샘플 데이터
  - 프로덕션 환경에서 실제 API 엔드포인트로 변경 가능

### ✅ 3. 데이터 변환 유틸

- **파일**: [src/domains/timeline/utils/dataTransformer.ts](utils/dataTransformer.ts)
- **함수**:
  - `transformTaskToTimelineItem()` - Task → TimelineItem (HTML 콘텐츠 포함)
  - `transformGroupToTimelineGroup()` - Group → TimelineGroup
  - `transformProjectToTimeline()` - 전체 데이터 변환
  - `generateTaskDetailHtml()` - 상세 정보 HTML 생성
- **특징**:
  - 상태별 색상 설정 (STATUS_CONFIG)
  - 우선순위별 이모지 (PRIORITY_CONFIG)
  - 이미지 + 상세 정보 HTML 렌더링

### ✅ 4. 상태 관리 Composable

- **파일**: [src/domains/timeline/composables/useTimelineProjectData.ts](composables/useTimelineProjectData.ts)
- **기능**:
  - 로딩 상태 관리 (loading)
  - 에러 처리 (error)
  - 데이터 캐싱 (data)
  - 선택 작업 상세 정보 (selectedTaskDetail)
- **메서드**:
  - `loadProject()` - API 데이터 로드
  - `selectTask(taskId)` - 작업 선택
  - `clearSelection()` - 선택 초기화
  - `getProgressStats()` - 진행률 통계

### ✅ 5. 완성된 예제 컴포넌트

- **파일**: [src/domains/timeline/examples/api/ApiProjectExample.vue](examples/api/ApiProjectExample.vue)
- **레이아웃**:
  ```
  ┌─────────────┬──────────────────┬──────────────┐
  │   Sidebar   │   Timeline       │   Details    │
  │ (통계/팀)  │   (메인)         │   (상세)     │
  └─────────────┴──────────────────┴──────────────┘
  ```
- **기능**:
  - 좌측: 프로젝트 통계, 팀별 작업 수
  - 중앙: vis-timeline (Groups & Items)
  - 우측: 선택된 작업 상세 정보 (HTML 콘텐츠)
- **상호작용**:
  - 아이템 클릭 → 상세 정보 표시
  - 로딩/에러 상태 처리
  - 반응형 디자인

### ✅ 6. 라우터 설정

- **파일**: [src/router/index.ts](../../router/index.ts)
- **경로**: `/timeline-examples`
- **페이지**: `TimelineExamplesPage.vue`
- **예제**: "API Project Management" (Advanced 카테고리)

### ✅ 7. 문서화

- **API 아키텍처 가이드**: [API_INTEGRATION.md](API_INTEGRATION.md)
- **프로젝트 구조**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 🚀 시작하기

### 1. 페이지 접속

```
http://localhost:5173/timeline-examples
```

### 2. "API Project Management" 예제 선택

좌측 네비게이션 → Advanced 카테고리 → "API Project Management"

### 3. 상호작용

- Timeline에서 아이템 클릭
- 우측 패널에서 상세 정보 확인
- 좌측 통계에서 진행 현황 확인

---

## 📊 주요 특징

### HTML Content 렌더링

Timeline 아이템에 다음 정보를 포함:

- ✅ 썸네일 이미지 (60x60px)
- ✅ 작업 제목
- ✅ 간단한 설명
- ✅ 상태 배지 (색상 코딩)
- ✅ 우선순위 아이콘
- ✅ 진행률 바

### 상세 정보 (Details Panel)

- ✅ 큰 이미지 (Full Width)
- ✅ 제목 및 설명
- ✅ 상태, 우선순위, 진행률
- ✅ 담당자 정보
- ✅ 타임라인 (시작/종료일)
- ✅ 태그
- ✅ 목표, 산출물, 리소스

### Best Practices 적용

- ✅ TypeScript 타입 안전성
- ✅ 관심사의 분리 (Separation of Concerns)
- ✅ 에러 처리 (Error Handling)
- ✅ 로딩 상태 관리 (Loading State)
- ✅ 단일 책임 원칙 (Single Responsibility)
- ✅ Composable 패턴
- ✅ 재사용 가능한 컴포넌트

---

## 🔌 프로덕션 환경 변경

### API 엔드포인트 변경

```typescript
// src/domains/timeline/api/timeline.api.ts

// 변경 전 (Mock)
export const fetchTimelineProject = async (): Promise<TimelineProject> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        /* mock data */
      })
    }, 500)
  })
}

// 변경 후 (실제 API)
export const fetchTimelineProject = async (): Promise<TimelineProject> => {
  return api.get('/api/projects/timeline')
}
```

### API 응답 형식

```json
{
  "groups": [
    {
      "id": 1,
      "name": "Team Name",
      "description": "Description",
      "teamLead": "Lead Name",
      "memberCount": 5
    }
  ],
  "tasks": [
    {
      "id": 1,
      "groupId": 1,
      "title": "Task Title",
      "description": "Description",
      "imageUrl": "https://...",
      "status": "in-progress",
      "priority": "high",
      "assignee": "Assignee Name",
      "startDate": "2024-01-01",
      "endDate": "2024-01-15",
      "progress": 50,
      "tags": ["tag1", "tag2"],
      "details": {
        "objectives": ["Objective 1"],
        "deliverables": ["Deliverable 1"],
        "resources": ["Resource 1"]
      }
    }
  ]
}
```

---

## 📁 파일 구조

```
src/domains/timeline/
├── types.ts                              ✅ 데이터 모델
├── API_INTEGRATION.md                    ✅ 아키텍처 가이드
├── PROJECT_STRUCTURE.md                  ✅ 구조 문서
├── api/
│   └── timeline.api.ts                   ✅ Mock API
├── utils/
│   └── dataTransformer.ts                ✅ 데이터 변환
├── composables/
│   ├── useTimeline.ts                    ✅ Timeline 관리
│   └── useTimelineProjectData.ts         ✅ 프로젝트 데이터 관리
└── examples/
    ├── api/
    │   └── ApiProjectExample.vue         ✅ API 통합 예제 (메인)
    ├── interaction/
    │   ├── SetSelectionExample.vue       ✅
    │   ├── EventListenersExample.vue     ✅
    │   ├── ClickToUseExample.vue         ✅
    │   ├── AnimateWindowExample.vue      ✅
    │   └── NavigationMenuExample.vue     ✅
    ├── items/
    │   ├── PointItemsExample.vue         ✅
    │   ├── BackgroundAreasExample.vue    ✅
    │   ├── HtmlContentsExample.vue       ✅
    │   └── TooltipExample.vue            ✅
    └── groups/
        └── GroupsExample.vue             ✅
```

---

## 🧪 테스트 시나리오

### 1. 로딩 상태 테스트

- 페이지 로드 시 로딩 스피너 표시 ✅
- 500ms 후 데이터 표시 ✅

### 2. Timeline 렌더링 테스트

- 3개 팀(Groups) 표시 ✅
- 9개 작업(Items) 표시 ✅
- HTML 이미지 렌더링 ✅

### 3. 상호작용 테스트

- 아이템 클릭 → 상세 정보 표시 ✅
- Clear Selection → 상세 정보 숨김 ✅
- 통계 업데이트 ✅

### 4. 통계 계산 테스트

- Completed: 2개 ✅
- In Progress: 3개 ✅
- Planning: 2개 ✅
- On Hold: 1개 ✅

---

## 💡 Customization 가이드

### 1. 색상 변경

```typescript
// src/domains/timeline/utils/dataTransformer.ts
const STATUS_CONFIG = {
  planning: { color: '#f59e0b' }, // 변경 가능
  'in-progress': { color: '#3b82f6' }, // 변경 가능
  completed: { color: '#10b981' }, // 변경 가능
  'on-hold': { color: '#ef4444' }, // 변경 가능
}
```

### 2. 우선순위 아이콘 변경

```typescript
const PRIORITY_CONFIG = {
  low: { emoji: '🟢' }, // 변경 가능
  medium: { emoji: '🟡' }, // 변경 가능
  high: { emoji: '🟠' }, // 변경 가능
  critical: { emoji: '🔴' }, // 변경 가능
}
```

### 3. HTML Content 템플릿 수정

```typescript
// src/domains/timeline/utils/dataTransformer.ts
const htmlContent = `
  <div style="padding: 8px;">
    <!-- 여기서 템플릿 수정 -->
  </div>
`
```

### 4. 레이아웃 변경

```vue
<!-- src/domains/timeline/examples/api/ApiProjectExample.vue -->
.content-layout { grid-template-columns: 250px 1fr 320px; /* 폭 조정 */ }
```

---

## 🎓 학습 자료

### 구조 학습 순서

1. [types.ts](types.ts) - 데이터 모델 이해
2. [timeline.api.ts](api/timeline.api.ts) - API 호출 방식
3. [dataTransformer.ts](utils/dataTransformer.ts) - 데이터 변환 로직
4. [useTimelineProjectData.ts](composables/useTimelineProjectData.ts) - 상태 관리
5. [ApiProjectExample.vue](examples/api/ApiProjectExample.vue) - 컴포넌트 통합

### 문서

- [API 아키텍처 가이드](API_INTEGRATION.md)
- [프로젝트 구조 다이어그램](PROJECT_STRUCTURE.md)

---

## ❓ FAQ

**Q. Mock API를 실제 API로 변경하려면?**
A. `timeline.api.ts`에서 `fetchTimelineProject` 함수의 Mock 부분을 실제 API 호출로 변경하면 됩니다.

**Q. 이미지 URL을 바꾸려면?**
A. `timeline.api.ts`에서 `imageUrl` 필드를 변경하거나, 데이터베이스에서 가져오도록 수정하세요.

**Q. 더 많은 필드를 추가하려면?**
A. `ProjectTask` 타입에 필드를 추가하고, `generateTaskDetailHtml`에서 해당 필드를 렌더링하면 됩니다.

**Q. Timeline 스타일을 변경하려면?**
A. `vis-timeline` CSS 클래스를 수정하거나, `className` 속성으로 커스텀 클래스를 추가할 수 있습니다.

---

## 📞 Support

문제가 발생하면:

1. 콘솔 에러 메시지 확인
2. [API_INTEGRATION.md](API_INTEGRATION.md) 문서 참고
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)에서 데이터 흐름 확인

---

**구현 완료 날짜**: 2024-01-20
**버전**: 1.0.0
