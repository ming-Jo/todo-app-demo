# Todo API Server

todo CRUD 기능을 제공하는 Express 서버입니다.

## 기능

- GET `/user-id` - 새로운 사용자 ID 발급 (UUID v4)
- GET `/todos` - 모든 todos 조회
- GET `/todos/:id` - 특정 todo 조회
- POST `/todos` - 새 todo 생성
- PUT `/todos/:id` - todo 전체 업데이트
- PATCH `/todos/:id` - todo 부분 업데이트
- DELETE `/todos/:id` - todo 삭제
- GET `/health` - 헬스체크 엔드포인트 (배포 플랫폼용)

## 설치 및 실행

```bash
cd apps/server
pnpm install
pnpm start
```

개발 모드 (파일 변경 시 자동 재시작):

```bash
pnpm dev
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## 데이터 저장

모든 데이터는 `server/data/todos.json` 파일에 저장됩니다.

## 배포

이 프로젝트는 [Render](https://render.com) 무료 플랜으로 배포중입니다.

1. 새 Web Service 생성
2. GitHub 리포지토리 연결
3. **Root Directory**: `apps/server` 설정
4. `render.yaml` 파일이 자동으로 설정을 적용합니다

### 헬스체크

서버는 `/health` 엔드포인트를 제공하여 배포 플랫폼의 헬스체크를 지원합니다.
Render에서 Health Check Path를 `/health`로 설정하면 sleep 모드를 방지하는 데 도움이 됩니다.

## 보안 기능

### CORS 제한

서버는 특정 도메인만 허용하도록 CORS가 설정되어 있습니다.

**환경 변수 설정:**

- `ALLOWED_ORIGINS`: 허용할 도메인 목록 (쉼표로 구분)
  - 예: `https://your-username.github.io,http://localhost:5173`

**Render에서 설정 (권장):**

1. Render 대시보드 → 서비스 → Environment
2. `ALLOWED_ORIGINS` 환경 변수 추가
3. 값: `https://ming-jo.github.io` (실제 GitHub Pages URL)
4. **중요**: `render.yaml`의 환경 변수가 적용되지 않는 경우, 대시보드에서 직접 설정해야 합니다.

**참고**: `render.yaml` 파일이 루트 디렉토리에 있지 않으면 환경 변수가 적용되지 않을 수 있습니다.

### Rate Limiting

과도한 요청을 방지하기 위해 Rate Limiting이 적용되어 있습니다.

**기본 설정:**

- 시간 창: 15분
- 최대 요청 수: 100개 (환경 변수로 변경 가능)

**환경 변수 설정:**

- `RATE_LIMIT_MAX`: 최대 요청 수 (기본값: 100)

**참고:**

- `/health` 엔드포인트는 Rate Limiting에서 제외됩니다.
