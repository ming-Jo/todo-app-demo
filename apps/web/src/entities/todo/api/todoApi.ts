import { apiClient } from '@shared/api/client';
import type { Todo, CreateTodoDto, UpdateTodoDto } from '../model/types';

export const todoApi = {
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
      userId: data.userId || 1,
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
