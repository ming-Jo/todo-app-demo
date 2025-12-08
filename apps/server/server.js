/* eslint-env node */
import crypto from 'crypto';

import { createClient } from '@supabase/supabase-js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.');
  console.warn('⚠️ SUPABASE_URL과 SUPABASE_API_KEY를 설정해주세요.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

    // 허용된 origin인지 확인 (대소문자 구분 없이)
    const normalizedOrigin = origin.toLowerCase();
    const isAllowed = allowedOrigins.some((allowed) => allowed.toLowerCase() === normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin} (allowed: ${allowedOrigins.join(', ')})`);
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
app.use(cookieParser());

// 사용자 ID 추출 미들웨어 (헬스체크는 제외)
app.use((req, res, next) => {
  // 헬스체크는 사용자 ID 검증 제외
  if (req.path === '/health') {
    return next();
  }

  // 쿠키에서 사용자 ID 읽기 (세션과 별개로 영구 저장)
  let userId = req.cookies['todo-user-id'];

  // 디버깅: 쿠키 정보 로그
  if (req.path === '/todos' && req.method === 'GET') {
    console.log(`[쿠키 확인] 모든 쿠키:`, req.cookies);
    console.log(`[쿠키 확인] todo-user-id:`, userId);
  }

  // 쿠키에 사용자 ID가 없으면 새로 생성
  if (!userId) {
    userId = generateUUID();
    // 쿠키에 사용자 ID 저장 (30일 유지)
    const cookieOptions = {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
      httpOnly: true, // XSS 공격 방지
    };

    // 프로덕션 환경 (cross-site 요청)
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true; // HTTPS 필수
      cookieOptions.sameSite = 'none'; // cross-site 요청 허용
    } else {
      // 개발 환경 (same-site 요청)
      cookieOptions.sameSite = 'lax'; // CSRF 공격 방지
    }

    res.cookie('todo-user-id', userId, cookieOptions);
    console.log(`[새 사용자 ID 생성] ${userId}`);
  }

  // req.userId에 저장하여 다음 미들웨어에서 사용
  req.userId = userId;

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

// Supabase에서 사용자별 todos 조회
async function getUserTodos(userId) {
  if (!supabase) {
    throw new Error('Supabase가 초기화되지 않았습니다.');
  }

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  // Supabase에서 가져온 데이터를 기존 형식으로 변환
  return (data || []).map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    userId: todo.user_id,
  }));
}

// UUID v4 생성 함수 (Node.js 버전 호환성)
function generateUUID() {
  // crypto.randomUUID()는 Node.js 14.17.0+ 에서 사용 가능
  // 하위 호환성을 위해 randomBytes 사용
  if (typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (error) {
      // randomUUID()가 실패하면 fallback 사용
      console.warn('crypto.randomUUID() failed, using fallback:', error);
    }
  }
  // fallback: randomBytes를 사용한 UUID v4 생성
  const bytes = crypto.randomBytes(16);
  // Buffer를 배열로 변환하여 수정
  const byteArray = Array.from(bytes);
  byteArray[6] = (byteArray[6] & 0x0f) | 0x40; // version 4
  byteArray[8] = (byteArray[8] & 0x3f) | 0x80; // variant
  const hex = Buffer.from(byteArray).toString('hex');
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}

// GET /user-id - 현재 사용자 ID 조회 (쿠키 기반)
app.get('/user-id', async (req, res) => {
  try {
    // 쿠키에서 사용자 ID 읽기
    let userId = req.cookies['todo-user-id'];

    // 쿠키에 사용자 ID가 없으면 새로 생성
    if (!userId) {
      userId = generateUUID();
      // 쿠키에 사용자 ID 저장
      const cookieOptions = {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
        httpOnly: true,
      };

      // 프로덕션 환경 (cross-site 요청)
      if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true; // HTTPS 필수
        cookieOptions.sameSite = 'none'; // cross-site 요청 허용
      } else {
        // 개발 환경 (same-site 요청)
        cookieOptions.sameSite = 'lax'; // CSRF 공격 방지
      }

      res.cookie('todo-user-id', userId, cookieOptions);
    }

    res.json({ userId });
  } catch (error) {
    console.error('Failed to get user ID:', error);
    res.status(500).json({ error: 'Failed to get user ID' });
  }
});

// GET /todos - 사용자별 todos 조회
app.get('/todos', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    console.log(`[GET /todos] userId: ${req.userId}`);
    const todos = await getUserTodos(req.userId);
    console.log(`[GET /todos] found ${todos.length} todos`);
    res.json(todos);
  } catch (error) {
    console.error('Failed to read todos:', error);
    res.status(500).json({ error: 'Failed to read todos' });
  }
});

// GET /todos/:id - 특정 todo 조회 (사용자별)
app.get('/todos/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const id = parseInt(req.params.id);

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({
      id: data.id,
      title: data.title,
      completed: data.completed,
      userId: data.user_id,
    });
  } catch (error) {
    console.error('Failed to read todo:', error);
    res.status(500).json({ error: 'Failed to read todo' });
  }
});

// POST /todos - 새 todo 생성 (사용자별)
app.post('/todos', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const { title, completed = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    console.log(`[POST /todos] userId: ${req.userId}, title: ${title}`);
    const { data, error } = await supabase
      .from('todos')
      .insert({
        title,
        completed: Boolean(completed),
        user_id: req.userId,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /todos] Supabase error:', error);
      throw error;
    }

    console.log(`[POST /todos] Created todo:`, data);
    res.status(201).json({
      id: data.id,
      title: data.title,
      completed: data.completed,
      userId: data.user_id,
    });
  } catch (error) {
    console.error('Failed to create todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /todos/:id - todo 전체 업데이트 (사용자별)
app.put('/todos/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    // 먼저 todo가 존재하고 사용자 소유인지 확인
    const { data: existingTodo, error: checkError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (checkError || !existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = Boolean(completed);

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      id: data.id,
      title: data.title,
      completed: data.completed,
      userId: data.user_id,
    });
  } catch (error) {
    console.error('Failed to update todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// PATCH /todos/:id - todo 부분 업데이트 (사용자별)
app.patch('/todos/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const id = parseInt(req.params.id);
    const { title, completed } = req.body;

    // 먼저 todo가 존재하고 사용자 소유인지 확인
    const { data: existingTodo, error: checkError } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.userId)
      .single();

    if (checkError || !existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (completed !== undefined) updateData.completed = Boolean(completed);

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      id: data.id,
      title: data.title,
      completed: data.completed,
      userId: data.user_id,
    });
  } catch (error) {
    console.error('Failed to update todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /todos/:id - todo 삭제 (사용자별)
app.delete('/todos/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const id = parseInt(req.params.id);

    const { error } = await supabase.from('todos').delete().eq('id', id).eq('user_id', req.userId);

    if (error) {
      throw error;
    }

    res.status(200).json({});
  } catch (error) {
    console.error('Failed to delete todo:', error);
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
  console.log(`Database: ${supabase ? 'Supabase (configured)' : 'Not configured'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`Rate limit: ${process.env.RATE_LIMIT_MAX || '100'} requests per 15 minutes`);
});
