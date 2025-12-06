/* eslint-env node */
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// CORS 설정 - 특정 도메인만 허용
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000']; // 개발 환경 기본값

const corsOptions = {
  origin: (origin, callback) => {
    // origin이 없는 경우 (같은 도메인에서의 요청, Postman 등) 허용
    if (!origin) {
      return callback(null, true);
    }

    // 허용된 origin인지 확인
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 최대 100개 요청 (환경 변수로 설정 가능)
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // `RateLimit-*` 헤더 반환
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// 사용자 ID 추출 미들웨어 (헬스체크 및 사용자 ID 발급 엔드포인트는 제외)
app.use((req, res, next) => {
  // 헬스체크 및 사용자 ID 발급 엔드포인트는 사용자 ID 검증 제외
  if (req.path === '/health' || req.path === '/user-id') {
    return next();
  }

  // x-user-id 헤더에서 사용자 ID 추출
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'User ID is required. Please provide x-user-id header.' });
  }

  // 헤더 값이 배열인 경우 첫 번째 값 사용, 아니면 문자열 그대로 사용
  const userIdString = Array.isArray(userId) ? userId[0] : String(userId);

  // req.userId에 저장하여 다음 미들웨어에서 사용
  req.userId = userIdString; // UUID 문자열로 저장

  next();
});

// Rate Limiting 적용 (헬스체크는 제외)
app.use((req, res, next) => {
  // 헬스체크 엔드포인트는 rate limiting 제외
  if (req.path === '/health') {
    return next();
  }
  limiter(req, res, next);
});

// 데이터 디렉토리 생성 (없는 경우)
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// JSON 파일에서 데이터 읽기
async function readTodos() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 파일이 없으면 빈 배열 반환
      return [];
    }
    throw error;
  }
}

// JSON 파일에 데이터 쓰기
async function writeTodos(todos) {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), 'utf-8');
}

// UUID v4 생성 함수 (Node.js 버전 호환성)
function generateUUID() {
  // crypto.randomUUID()는 Node.js 14.17.0+ 에서 사용 가능
  // 하위 호환성을 위해 randomBytes 사용
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // fallback: randomBytes를 사용한 UUID v4 생성
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  return [
    bytes.toString('hex', 0, 4),
    bytes.toString('hex', 4, 6),
    bytes.toString('hex', 6, 8),
    bytes.toString('hex', 8, 10),
    bytes.toString('hex', 10, 16),
  ].join('-');
}

// GET /user-id - 새로운 사용자 ID 발급
app.get('/user-id', async (req, res) => {
  try {
    // UUID v4 생성
    const userId = generateUUID();
    res.json({ userId });
  } catch (error) {
    console.error('Failed to generate user ID:', error);
    res.status(500).json({ error: 'Failed to generate user ID' });
  }
});

// GET /todos - 사용자별 todos 조회
app.get('/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    // 요청한 사용자의 todos만 필터링 (userId는 문자열로 비교)
    const userTodos = todos.filter((t) => String(t.userId) === String(req.userId));
    res.json(userTodos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todos' });
  }
});

// GET /todos/:id - 특정 todo 조회 (사용자별)
app.get('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const todo = todos.find((t) => t.id === id && String(t.userId) === String(req.userId));

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todo' });
  }
});

// POST /todos - 새 todo 생성 (사용자별)
app.post('/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    const { title, completed = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // 새 ID 생성 (기존 최대 ID + 1)
    const maxId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) : 0;
    const newTodo = {
      id: maxId + 1,
      title,
      completed: Boolean(completed),
      userId: req.userId, // 헤더에서 추출한 사용자 ID 사용
    };

    todos.push(newTodo);
    await writeTodos(todos);

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /todos/:id - todo 전체 업데이트 (사용자별)
app.put('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex((t) => t.id === id && String(t.userId) === String(req.userId));

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed } = req.body;
    todos[index] = {
      id,
      title: title ?? todos[index].title,
      completed: completed !== undefined ? Boolean(completed) : todos[index].completed,
      userId: req.userId, // 사용자 ID는 변경 불가
    };

    await writeTodos(todos);
    res.json(todos[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// PATCH /todos/:id - todo 부분 업데이트 (사용자별)
app.patch('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex((t) => t.id === id && String(t.userId) === String(req.userId));

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { title, completed } = req.body;
    if (title !== undefined) todos[index].title = title;
    if (completed !== undefined) todos[index].completed = Boolean(completed);
    // userId는 변경 불가 (헤더에서 추출한 사용자 ID로 고정)

    await writeTodos(todos);
    res.json(todos[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /todos/:id - todo 삭제 (사용자별)
app.delete('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex((t) => t.id === id && String(t.userId) === String(req.userId));

    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos.splice(index, 1);
    await writeTodos(todos);

    res.status(200).json({});
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Health check endpoint (Render sleep 모드 방지에 도움)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Todo API server is running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`Rate limit: ${process.env.RATE_LIMIT_MAX || '100'} requests per 15 minutes`);
});
