# Timeline Backend Server

Node.js Express 기반 Timeline 프로젝트의 백엔드 서버입니다.

## 기술 스택

- Node.js (ES Modules)
- Express.js
- CORS

## 설치

```bash
cd server
npm install
```

## 실행

### 개발 모드 (nodemon)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### Tree API (트리 구조)

#### 루트 노드 조회
```
GET /api/tree/roots
```

Response:
```json
[
  {
    "id": "1",
    "name": "Engineering",
    "level": 1,
    "hasChildren": true
  }
]
```

#### 자식 노드 조회
```
GET /api/tree/:nodeId/children
```

Response:
```json
[
  {
    "id": "1-1",
    "name": "Frontend",
    "level": 2,
    "parentId": "1",
    "hasChildren": true
  }
]
```

#### 특정 노드 조회
```
GET /api/tree/:nodeId
```

Response:
```json
{
  "id": "1",
  "name": "Engineering",
  "level": 1,
  "hasChildren": true
}
```

### Items API (타임라인 아이템)

#### 모든 아이템 조회
```
GET /api/items/all
```

#### 특정 그룹의 아이템 조회
```
GET /api/items/group/:groupId
```

#### 특정 아이템 조회
```
GET /api/items/:itemId
```

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

## 프로젝트 구조

```
server/
├── package.json
├── src/
│   ├── index.js          # 서버 진입점
│   ├── data/
│   │   ├── treeData.js   # 트리 구조 데이터
│   │   └── itemsData.js  # 타임라인 아이템 데이터
│   └── routes/
│       ├── tree.js       # 트리 API 라우터
│       └── items.js      # 아이템 API 라우터
└── README.md
```

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)

```bash
PORT=3001 npm start
```

## 개발 시 주의사항

1. **CORS 설정**: 기본적으로 모든 origin을 허용합니다. 프로덕션에서는 제한해야 합니다.

2. **Mock Delay**: 실제 네트워크 지연을 시뮬레이션하기 위해 응답에 의도적인 지연이 있습니다:
   - Tree roots: 500ms
   - Tree children: 300ms
   - Tree node: 200ms
   - Items: 800ms

3. **데이터 추가**: 더 많은 아이템 데이터를 추가하려면 `src/data/itemsData.js`에서 원본 `items.api.ts`의 `mockItemsData`를 복사하세요.

## 프론트엔드 연동

프론트엔드 프로젝트의 `.env.development` 파일에 다음을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 동시 실행

프론트엔드와 백엔드를 동시에 실행하려면 루트 디렉토리의 `package.json`에 다음 스크립트를 추가하세요:

```json
{
  "scripts": {
    "dev:server": "cd server && npm run dev",
    "dev:client": "vite",
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\""
  }
}
```

그리고 `concurrently`를 설치하세요:

```bash
npm install -D concurrently
```

실행:

```bash
npm run dev
```
