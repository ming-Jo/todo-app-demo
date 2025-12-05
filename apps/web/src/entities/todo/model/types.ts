export interface Todo {
  id: number
  title: string
  completed: boolean
  userId: number
}

export interface CreateTodoDto {
  title: string
  completed?: boolean
  userId?: number
}

export interface UpdateTodoDto {
  title?: string
  completed?: boolean
}

