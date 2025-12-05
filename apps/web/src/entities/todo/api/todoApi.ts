import { apiClient } from '@shared/api/client';

import { localStorageApi } from './localStorageApi';

import type { Todo, CreateTodoDto, UpdateTodoDto } from '../model/types';

// 서버 API URL 가져오기
const getApiBaseURL = () => {
  // 환경 변수가 명시적으로 설정된 경우 사용
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 개발 환경인 경우 로컬 서버 사용
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }

  return '';
};

// 서버 API 사용 여부 결정
// 서버 URL이 있으면 서버 API 사용 (로컬 개발 환경 포함)
// VITE_USE_SERVER_API가 'false'로 명시적으로 설정된 경우에만 로컬스토리지 사용
const shouldUseServerApi = () => {
  // 명시적으로 false로 설정된 경우 로컬스토리지 사용
  if (import.meta.env.VITE_USE_SERVER_API === 'false') {
    return false;
  }

  // 서버 URL이 있으면 서버 API 사용
  const baseURL = getApiBaseURL();
  return !!baseURL;
};

// 서버 API 구현
const serverApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await apiClient.get<Todo[]>('/todos');
    return response.data;
  },

  getById: async (id: number): Promise<Todo> => {
    const response = await apiClient.get<Todo>(`/todos/${id}`);
    return response.data;
  },

  create: async (data: CreateTodoDto): Promise<Todo> => {
    const response = await apiClient.post<Todo>('/todos', {
      ...data,
      // userId는 서버에서 x-user-id 헤더로 자동 설정됨
    });
    return response.data;
  },

  update: async (id: number, data: UpdateTodoDto): Promise<Todo> => {
    const response = await apiClient.patch<Todo>(`/todos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};

// 환경에 따라 적절한 API 선택
export const todoApi = shouldUseServerApi() ? serverApi : localStorageApi;
