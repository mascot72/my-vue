# Timeline 프로젝트 셋업 가이드

## 프로젝트 개요

이 프로젝트는 Vue 3 프론트엔드와 Node.js Express 백엔드로 구성된 풀스택 Timeline 애플리케이션입니다.

## 아키텍처

```
┌─────────────────────┐          ┌─────────────────────┐
│   Vue 3 Frontend    │          │  Express Backend    │
│   (Port: 5173)      │ ◄─────► │  (Port: 3001)       │
│                     │   HTTP   │                     │
│  - Components       │          │  - REST API         │
│  - Pinia Stores     │          │  - Mock Data        │
│  - Axios Client     │          │  - CORS Enabled     │
└─────────────────────┘          └─────────────────────┘
```

## 기술 스택

### Frontend
- **Vue 3** - Composition API
- **TypeScript** - 타입 안전성
- **Pinia** - 상태 관리
- **Vue Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **vis-timeline** - 타임라인 시각화
- **Vite** - 빌드 도구

### Backend
- **Node.js** - 런타임
- **Express.js** - 웹 프레임워크
- **ES Modules** - 모던 JavaScript
- **CORS** - Cross-Origin Resource Sharing

## 설치 가이드

### 1. 저장소 클론

```bash
git clone <repository-url>
cd my-vue
```

### 2. 프론트엔드 설치

```bash
npm install
```

### 3. 백엔드 설치

```bash
cd server
npm install
cd ..
```

### 4. concurrently 설치 (동시 실행용)

```bash
npm install -D concurrently
```

## 실행 방법

### 방법 1: 동시 실행 (권장)

프론트엔드와 백엔드를 동시에 실행:

```bash
npm run dev:all
```

실행 결과:
- 🚀 Backend: http://localhost:3001
- ⚡️ Frontend: http://localhost:5173

### 방법 2: 개별 실행

#### 1) 백엔드 서버 실행 (터미널 1)

```bash
npm run dev:server
```

또는

```bash
cd server
npm run dev
```

#### 2) 프론트엔드 실행 (터미널 2)

```bash
npm run dev
```

## 환경 변수

### Frontend (.env.development)

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

이 파일은 프로젝트 루트에 이미 생성되어 있습니다.

### Backend (선택사항)

기본 포트(3001)를 변경하려면:

```bash
PORT=4000 npm start
```

## API 엔드포인트

### Tree API (트리 구조)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tree/roots` | 루트 노드 조회 (Level 1) |
| GET | `/api/tree/:nodeId/children` | 자식 노드 조회 |
| GET | `/api/tree/:nodeId` | 특정 노드 정보 조회 |

### Items API (타임라인 아이템)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items/all` | 모든 아이템 조회 |
| GET | `/api/items/group/:groupId` | 특정 그룹의 아이템 조회 |
| GET | `/api/items/:itemId` | 특정 아이템 조회 |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | 서버 상태 확인 |

## API 테스트

### curl로 테스트

```bash
# Health check
curl http://localhost:3001/health

# 루트 노드 조회
curl http://localhost:3001/api/tree/roots

# 자식 노드 조회
curl http://localhost:3001/api/tree/1/children

# 모든 아이템 조회
curl http://localhost:3001/api/items/all

# 특정 그룹의 아이템 조회
curl http://localhost:3001/api/items/group/4
```

### 브라우저에서 테스트

브라우저에서 http://localhost:3001/health 를 열어 확인할 수 있습니다.

## 개발 워크플로우

### 1. 서버 실행 확인

```bash
# Health check
curl http://localhost:3001/health

# 예상 결과:
# {"status":"ok","timestamp":"2026-03-10T..."}
```

### 2. 프론트엔드 접속

브라우저에서 http://localhost:5173 접속

### 3. Timeline 페이지 이동

네비게이션에서 "Enhanced" 클릭 → Timeline 페이지 확인

### 4. 동작 확인

- 트리 노드 클릭 → 하위 노드 펼치기/접기
- 타임라인 카드 클릭 → 확대/포커스
- 카드에 마우스 오버 → 상세 정보 팝업

## 트러블슈팅

### 1. 포트 충돌

**증상**: `Error: listen EADDRINUSE: address already in use :::3001`

**해결**:
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3001

# 프로세스 종료
kill -9 <PID>

# 또는 다른 포트 사용
PORT=4000 npm run dev:server
```

### 2. CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결**: 서버가 정상적으로 실행 중인지 확인:
```bash
curl http://localhost:3001/health
```

### 3. axios 에러

**증상**: `Network Error` 또는 연결 실패

**체크리스트**:
- [ ] 백엔드 서버가 실행 중인가?
- [ ] `.env.development` 파일이 존재하는가?
- [ ] `VITE_API_BASE_URL`이 올바른가?

### 4. 데이터 로딩 실패

**증상**: 트리나 아이템이 표시되지 않음

**해결**:
1. 브라우저 개발자 도구 → Network 탭 확인
2. API 요청이 실패했는지 확인
3. 서버 터미널에서 에러 로그 확인

## 데이터 추가

더 많은 아이템 데이터를 추가하려면:

1. `src/domains/timeline/api/items.api.ts`에서 원본 `mockItemsData` 확인
2. `server/src/data/itemsData.js`에 데이터 복사
3. 서버 재시작

## 프로덕션 빌드

### Frontend

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

### Backend

백엔드는 별도 빌드 없이 Node.js로 직접 실행:

```bash
cd server
npm start
```

## 추가 리소스

- [Vue 3 문서](https://vuejs.org/)
- [Express 문서](https://expressjs.com/)
- [vis-timeline 문서](https://visjs.github.io/vis-timeline/docs/timeline/)
- [Pinia 문서](https://pinia.vuejs.org/)

## 지원

문제가 발생하면 다음을 확인하세요:

1. Node.js 버전: `node --version` (권장: v20.19.0 이상)
2. npm 버전: `npm --version`
3. 포트 사용 여부: `lsof -i :3001`, `lsof -i :5173`
4. 로그 확인: 터미널에서 에러 메시지 확인
