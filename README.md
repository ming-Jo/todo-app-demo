# Todo App

Vite + React + TypeScript로 구성된 Todo 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Vite + React + TypeScript
- **아키텍처**: Feature Sliced Design
- **스타일링**: TailwindCSS + shadcn/ui
- **상태 관리**: React Query + Zustand
- **API**: JSONPlaceholder (typicode)

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

# 개발 서버 실행
pnpm run dev

# 빌드
pnpm run build

# 프리뷰
pnpm run preview
```

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

