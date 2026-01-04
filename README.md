# Todo Monorepo

Turborepo와 pnpm을 사용하는 Todo 애플리케이션 monorepo입니다.

## 목차

- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [데이터베이스 설정](#데이터베이스-설정)
- [환경 변수 설정](#환경-변수-설정)
- [배포 환경](#배포-환경)
- [API 엔드포인트](#api-엔드포인트)
- [주요 기능](#주요-기능)
- [Feature Sliced Design](#feature-sliced-design)

## 기술 스택

### 프론트엔드 (apps/web)

- **프레임워크**: Vite + React + TypeScript
- **아키텍처**: Feature Sliced Design
- **스타일링**: TailwindCSS + shadcn/ui
- **상태 관리**: React Query + Zustand

### 백엔드 (apps/server)

- **프레임워크**: Express.js
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: 쿠키 기반 사용자 ID 관리
- **보안**: CORS, Rate Limiting

### Monorepo 도구

- **패키지 관리자**: pnpm
- **빌드 시스템**: Turborepo

## 프로젝트 구조

```bash
.
├── apps/
│   ├── web/         # 프론트엔드 앱 (React)
│   │   └── src/
│   │       ├── app/
│   │       ├── pages/
│   │       ├── widgets/
│   │       ├── features/
│   │       ├── entities/
│   │       └── shared/
│   └── server/      # 백엔드 API 서버 (Express.js)
│       ├── server.js
│       ├── supabase-setup.sql
│       └── render.yaml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 설치 및 실행

```bash
# 패키지 설치 (모든 앱)
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

## 데이터베이스 설정

이 프로젝트는 Supabase (PostgreSQL)를 데이터베이스로 사용합니다.

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL (`SUPABASE_URL`)
   - API Key (`SUPABASE_API_KEY`)

### 2. 데이터베이스 테이블 생성

Supabase 대시보드의 SQL Editor에서 `apps/server/supabase-setup.sql` 파일의 내용을 실행하세요.

이 스크립트는 다음을 생성합니다:

- `todos` 테이블 (id, title, completed, user_id, created_at, updated_at)
- 사용자별 조회를 위한 인덱스
- `updated_at` 자동 업데이트 트리거
- **RLS (Row Level Security) 명시적 비활성화** - 보안 에러 방지

**⚠️ 보안 에러 해결 방법:**

- `supabase-setup.sql`을 실행하면 RLS가 자동으로 비활성화됩니다
- 만약 보안 에러가 계속 발생한다면:
  1. Supabase 대시보드 → Authentication → Policies에서 `todos` 테이블의 RLS가 비활성화되어 있는지 확인
  2. Service Role Key를 사용하는지 확인 (Anon Key는 RLS에 영향을 받음)

## 환경 변수 설정

### 프론트엔드 (apps/web)

- 개발 환경: `localhost:3001` 사용
- 프로덕션 환경: GitHub Actions Secrets에 `VITE_API_BASE_URL` 설정 (배포 섹션 참고)

### 백엔드 (apps/server)

#### 개발 환경

`apps/server` 디렉토리에 `.env` 파일 생성:

```env
NODE_ENV=development
SUPABASE_URL=https://my-project.supabase.co
SUPABASE_API_KEY=my-service-role-key
```

**⚠️ 중요: API 키 선택**

- **Service Role Key (권장)**: 서버 사이드에서 사용. RLS를 우회하여 모든 작업 수행 가능
- **Anon Key**: RLS가 활성화되어 있으면 보안 에러 발생 가능

Service Role Key는 Supabase 대시보드 → Settings → API → `service_role` secret 키에서 확인할 수 있습니다.

#### 프로덕션 환경

배포 플랫폼([Render](https://render.com/))에서 다음 환경 변수 설정:

**필수 환경 변수:**

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_API_KEY`: Supabase Service Role Key (권장) 또는 Anon Key
  - **Service Role Key 권장**: 서버 사이드에서 RLS를 우회하여 안정적으로 동작
  - Service Role Key는 Supabase 대시보드 → Settings → API → `service_role` secret 키
  - Anon Key 사용 시 RLS가 비활성화되어 있어야 함

**선택 환경 변수:**

- `PORT`: 서버 포트 (기본값: 3001)
- `NODE_ENV`: 환경 설정 (production)
- `ALLOWED_ORIGINS`: CORS 허용 도메인 (쉼표로 구분)
  - 예: `https://username.github.io,https://username.github.io/todo-app-demo`
  - GitHub Pages 도메인을 반드시 포함해야 합니다
- `RATE_LIMIT_MAX`: Rate Limiting 최대 요청 수 (기본값: 100)

## 배포 환경

이 프로젝트는 프론트엔드와 백엔드를 분리하여 배포합니다.

### 프론트엔드 (GitHub Pages)

- **플랫폼**: GitHub Pages
- **배포 방식**: GitHub Actions를 통한 자동 배포 (`.github/workflows/deploy.yml`)
- **빌드**: Vite로 정적 파일 생성 후 GitHub Pages에 자동 배포
- **환경 변수**: GitHub Actions Secrets에 `VITE_API_BASE_URL` 설정 필요
- **설정**: `apps/web/vite.config.ts`의 `base` 경로가 저장소 이름과 일치해야 함

### 백엔드 (Render)

- **플랫폼**: [Render](https://render.com/)
- **배포 방식**: GitHub 저장소 연결 후 자동 배포
- **환경 변수**: Supabase 설정 및 CORS 도메인 설정 필요
- **헬스체크**: `/health` 엔드포인트로 서비스 상태 확인
- **CORS**: 프론트엔드 도메인(GitHub Pages)을 `ALLOWED_ORIGINS`에 포함해야 함

## API 엔드포인트

백엔드 서버는 다음 REST API 제공:

### 인증

- `GET /user-id` - 현재 사용자 ID 조회 (쿠키 기반)

### Todos

- `GET /todos` - 사용자별 모든 todos 조회
- `GET /todos/:id` - 특정 todo 조회
- `POST /todos` - 새 todo 생성
- `PUT /todos/:id` - todo 전체 업데이트
- `PATCH /todos/:id` - todo 부분 업데이트
- `DELETE /todos/:id` - todo 삭제

### 헬스체크

- `GET /health` - 서버 상태 확인

### 인증 및 보안

- **사용자 인증**: 쿠키 기반 사용자 ID 관리
  - 서버가 자동으로 사용자 ID를 생성하고 쿠키에 저장
  - 쿠키가 없는 경우 헤더(`x-user-id`)로 fallback 지원
- **CORS**: 허용된 도메인만 API 접근 가능
- **Rate Limiting**: 15분당 최대 요청 수 제한 (기본값: 100)

## 주요 기능

- ✅ Todo 생성
- ✅ Todo 완료/미완료 토글
- ✅ Todo 삭제
- ✅ Todo 필터링 (전체/진행중/완료)
- ✅ 사용자별 Todo 관리 (쿠키 기반)

## Feature Sliced Design

프론트엔드 앱은 Feature Sliced Design 아키텍처를 사용합니다.

- **app/**: 앱 초기화 및 전역 프로바이더
- **pages/**: 라우트별 페이지 컴포넌트
- **widgets/**: 여러 feature를 조합한 복합 컴포넌트
- **features/**: 비즈니스 기능 단위
- **entities/**: 비즈니스 엔티티 (데이터 모델, API, 스토어)
- **shared/**: 공유 코드 (UI 컴포넌트, 유틸리티, API 클라이언트)
