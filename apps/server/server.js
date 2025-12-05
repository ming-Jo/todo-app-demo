/* eslint-env node */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Middleware
app.use(cors());
app.use(express.json());

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

// GET /todos - 모든 todos 조회
app.get('/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todos' });
  }
});

// GET /todos/:id - 특정 todo 조회
app.get('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read todo' });
  }
});

// POST /todos - 새 todo 생성
app.post('/todos', async (req, res) => {
  try {
    const todos = await readTodos();
    const { title, completed = false, userId = 1 } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // 새 ID 생성 (기존 최대 ID + 1)
    const maxId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) : 0;
    const newTodo = {
      id: maxId + 1,
      title,
      completed: Boolean(completed),
      userId: Number(userId),
    };
    
    todos.push(newTodo);
    await writeTodos(todos);
    
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// PUT /todos/:id - todo 전체 업데이트
app.put('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const { title, completed, userId } = req.body;
    todos[index] = {
      id,
      title: title ?? todos[index].title,
      completed: completed !== undefined ? Boolean(completed) : todos[index].completed,
      userId: userId !== undefined ? Number(userId) : todos[index].userId,
    };
    
    await writeTodos(todos);
    res.json(todos[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// PATCH /todos/:id - todo 부분 업데이트
app.patch('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const { title, completed, userId } = req.body;
    if (title !== undefined) todos[index].title = title;
    if (completed !== undefined) todos[index].completed = Boolean(completed);
    if (userId !== undefined) todos[index].userId = Number(userId);
    
    await writeTodos(todos);
    res.json(todos[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /todos/:id - todo 삭제
app.delete('/todos/:id', async (req, res) => {
  try {
    const todos = await readTodos();
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`Todo API server is running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});

