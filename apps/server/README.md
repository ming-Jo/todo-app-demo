# Todo API Server

todo CRUD 기능을 제공하는 Express 서버입니다.

## 기능

- GET `/todos` - 모든 todos 조회
- GET `/todos/:id` - 특정 todo 조회
- POST `/todos` - 새 todo 생성
- PUT `/todos/:id` - todo 전체 업데이트
- PATCH `/todos/:id` - todo 부분 업데이트
- DELETE `/todos/:id` - todo 삭제

## 설치 및 실행

```bash
cd server
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

