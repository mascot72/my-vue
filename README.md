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
