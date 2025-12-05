import { create } from 'zustand'
import type { Todo } from './types'

interface TodoStore {
  selectedTodoId: number | null
  setSelectedTodoId: (id: number | null) => void
  filter: 'all' | 'active' | 'completed'
  setFilter: (filter: 'all' | 'active' | 'completed') => void
}

export const useTodoStore = create<TodoStore>((set) => ({
  selectedTodoId: null,
  setSelectedTodoId: (id) => set({ selectedTodoId: id }),
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))

