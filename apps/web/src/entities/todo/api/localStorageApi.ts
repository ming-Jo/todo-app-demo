import type { Todo, CreateTodoDto, UpdateTodoDto } from '../model/types';

const STORAGE_KEY = 'todos';
const USER_ID_STORAGE_KEY = 'todo-app-user-id';

// 로컬 사용자 ID 가져오기 또는 생성
function getOrCreateLocalUserId(): string {
  const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (storedUserId) {
    return storedUserId;
  }
  // 로컬에서 ID 생성
  const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem(USER_ID_STORAGE_KEY, localId);
  return localId;
}

// localStorage에서 todos 읽기
function getTodosFromStorage(): Todo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to read todos from localStorage:', error);
    return [];
  }
}

// localStorage에 todos 저장
function saveTodosToStorage(todos: Todo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
    throw new Error('Failed to save todos');
  }
}

// 약간의 지연을 추가하여 실제 API처럼 느끼게 함
function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const localStorageApi = {
  getAll: async (): Promise<Todo[]> => {
    await delay();
    return getTodosFromStorage();
  },

  getById: async (id: number): Promise<Todo> => {
    await delay();
    const todos = getTodosFromStorage();
    const todo = todos.find((t) => t.id === id);
    if (!todo) {
      throw new Error(`Todo with id ${id} not found`);
    }
    return todo;
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    await delay();
    const todos = getTodosFromStorage();
    const maxId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) : 0;
    const newTodo: Todo = {
      id: maxId + 1,
      title: data.title,
      completed: data.completed ?? false,
      userId: data.userId ?? getOrCreateLocalUserId(),
    };
    todos.push(newTodo);
    saveTodosToStorage(todos);
    return newTodo;
  },

  update: async (id: number, data: UpdateTodoDto): Promise<Todo> => {
    await delay();
    const todos = getTodosFromStorage();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }
    if (data.title !== undefined) todos[index].title = data.title;
    if (data.completed !== undefined) todos[index].completed = data.completed;
    saveTodosToStorage(todos);
    return todos[index];
  },

  delete: async (id: number): Promise<void> => {
    await delay();
    const todos = getTodosFromStorage();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Todo with id ${id} not found`);
    }
    todos.splice(index, 1);
    saveTodosToStorage(todos);
  },
};
