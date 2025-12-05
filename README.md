# Todo App

Vite + React + TypeScript로 구성된 Todo 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **아키텍처**: Feature Sliced Design
- **스타일링**: TailwindCSS + shadcn/ui
- **상태 관리**: React Query + Zustand
- **API**: Express 서버 (로컬)

## 프로젝트 구조

```
src/
├── app/              # 앱 초기화, 프로바이더
├── pages/            # 페이지 컴포넌트
├── widgets/          # 복합 UI 블록
├── features/         # 비즈니스 기능
│   ├── todo-create/  # Todo 생성 기능
│   ├── todo-item/    # Todo 아이템 기능
│   └── todo-filter/  # Todo 필터 기능
├── entities/         # 비즈니스 엔티티
│   └── todo/         # Todo 엔티티
└── shared/           # 공유 코드
    ├── api/          # API 클라이언트
    ├── lib/          # 유틸리티
    └── ui/           # UI 컴포넌트
```

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# API 서버 실행 (별도 터미널)
pnpm server
# 또는
cd server && pnpm install && pnpm start

# 프론트엔드 개발 서버 실행
pnpm run dev

# 빌드
pnpm run build

# 프리뷰
pnpm run preview
```

## 환경 변수 설정

### 개발 환경

프로젝트 루트에 `.env.development` 파일을 생성하거나, 기본값(`http://localhost:3001`)을 사용합니다.

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 프로덕션 환경 (배포)

배포 시 프로덕션 API 서버 URL을 설정해야 합니다.

#### 방법 1: 환경 변수 파일 사용

프로젝트 루트에 `.env.production` 파일 생성:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

#### 방법 2: 배포 플랫폼에서 환경 변수 설정

**Vercel:**
- Settings → Environment Variables → `VITE_API_BASE_URL` 추가

**Netlify:**
- Site settings → Environment variables → `VITE_API_BASE_URL` 추가

**GitHub Actions / CI/CD:**
```yaml
env:
  VITE_API_BASE_URL: https://api.yourdomain.com
```

**Docker:**
```dockerfile
ENV VITE_API_BASE_URL=https://api.yourdomain.com
```

> ⚠️ **주의**: Vite는 빌드 타임에 환경 변수를 주입하므로, 배포 플랫폼에서 환경 변수를 설정한 후 **반드시 다시 빌드**해야 합니다.

## 주요 기능

- ✅ Todo 생성
- ✅ Todo 완료/미완료 토글
- ✅ Todo 삭제
- ✅ Todo 필터링 (전체/진행중/완료)
- ✅ JSONPlaceholder API 연동

## Feature Sliced Design

이 프로젝트는 Feature Sliced Design 아키텍처를 따릅니다:

- **app/**: 앱 초기화 및 전역 프로바이더
- **pages/**: 라우트별 페이지 컴포넌트
- **widgets/**: 여러 feature를 조합한 복합 컴포넌트
- **features/**: 비즈니스 기능 단위
- **entities/**: 비즈니스 엔티티 (데이터 모델, API, 스토어)
- **shared/**: 공유 코드 (UI 컴포넌트, 유틸리티, API 클라이언트)

