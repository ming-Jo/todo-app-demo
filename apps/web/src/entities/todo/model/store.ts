import { create } from 'zustand';

interface TodoStore {
  selectedTodoId: number | null;
  setSelectedTodoId: (id: number | null) => void;
  filter: 'all' | 'active' | 'completed';
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  selectedTodoId: null,
  setSelectedTodoId: (id) => set({ selectedTodoId: id }),
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  viewMode: 'kanban',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
