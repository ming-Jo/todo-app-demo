export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: string;
}

export interface CreateTodoDto {
  title: string;
  completed?: boolean;
  userId?: string;
}

export interface UpdateTodoDto {
  title?: string;
  completed?: boolean;
}
