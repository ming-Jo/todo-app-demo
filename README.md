# Todo Monorepo

Turborepo와 pnpm을 사용하는 Todo 애플리케이션 monorepo입니다.

## 기술 스택

### 프론트엔드 (apps/web)
- **프레임워크**: Vite + React + TypeScript
- **아키텍처**: Feature Sliced Design
- **스타일링**: TailwindCSS + shadcn/ui
- **상태 관리**: React Query + Zustand

### 백엔드 (apps/server)
- **프레임워크**: Express.js
- **데이터 저장**: JSON 파일

### Monorepo 도구
- **패키지 관리자**: pnpm
- **빌드 시스템**: Turborepo

## 프로젝트 구조

```
.
├── apps/
│   ├── web/          # React 프론트엔드 앱
│   │   └── src/
│   │       ├── app/              # 앱 초기화, 프로바이더
│   │       ├── pages/            # 페이지 컴포넌트
│   │       ├── widgets/          # 복합 UI 블록
│   │       ├── features/         # 비즈니스 기능
│   │       ├── entities/         # 비즈니스 엔티티
│   │       └── shared/           # 공유 코드
│   └── server/       # Express API 서버
│       ├── server.js
│       └── data/     # JSON 데이터 저장소
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 설치 및 실행

```bash
# 의존성 설치 (모든 앱)
pnpm install

# 모든 앱 개발 서버 실행
pnpm dev

# 특정 앱만 실행
pnpm --filter web dev      # 프론트엔드만
pnpm --filter server dev   # 서버만

# 빌드
pnpm build

# 특정 앱 빌드
pnpm --filter web build
```

## 개별 앱 실행

### 서버 (apps/server)

```bash
cd apps/server
pnpm install
pnpm dev    # 개발 모드 (--watch)
pnpm start  # 프로덕션 모드
```

기본 포트: `http://localhost:3001`

### 웹 앱 (apps/web)

```bash
cd apps/web
pnpm install
pnpm dev      # 개발 서버
pnpm build    # 빌드
pnpm preview  # 빌드 결과 미리보기
```

## 환경 변수 설정

### 개발 환경

`apps/web` 디렉토리에 `.env.development` 파일을 생성하거나, 기본값(`http://localhost:3001`)을 사용합니다.

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 프로덕션 환경 (배포)

배포 시 프로덕션 API 서버 URL을 설정해야 합니다.

#### 방법 1: 환경 변수 파일 사용

`apps/web` 디렉토리에 `.env.production` 파일 생성:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

#### 방법 2: 배포 플랫폼에서 환경 변수 설정

**Vercel:**
- Settings → Environment Variables → `VITE_API_BASE_URL` 추가

**Netlify:**
- Site settings → Environment variables → `VITE_API_BASE_URL` 추가

> ⚠️ **주의**: Vite는 빌드 타임에 환경 변수를 주입하므로, 배포 플랫폼에서 환경 변수를 설정한 후 **반드시 다시 빌드**해야 합니다.

## 주요 기능

- ✅ Todo 생성
- ✅ Todo 완료/미완료 토글
- ✅ Todo 삭제
- ✅ Todo 필터링 (전체/진행중/완료)

## Feature Sliced Design

프론트엔드 앱은 Feature Sliced Design 아키텍처를 따릅니다:

- **app/**: 앱 초기화 및 전역 프로바이더
- **pages/**: 라우트별 페이지 컴포넌트
- **widgets/**: 여러 feature를 조합한 복합 컴포넌트
- **features/**: 비즈니스 기능 단위
- **entities/**: 비즈니스 엔티티 (데이터 모델, API, 스토어)
- **shared/**: 공유 코드 (UI 컴포넌트, 유틸리티, API 클라이언트)
