import { useQuery } from '@tanstack/react-query';
import { todoApi } from '@entities/todo/api/todoApi';
import { useTodoStore } from '@entities/todo/model/store';
import { TodoItem } from '@features/todo-item/ui/TodoItem';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card';
import type { Todo } from '@entities/todo/model/types';
import { TodoFilter } from '@/features/todo-filter/ui/TodoFilter';

interface KanbanColumnProps {
  title: string;
  todos: Todo[];
}

const KanbanColumn = ({ title, todos }: KanbanColumnProps) => {
  return (
    <div className='flex-1 min-w-[300px]'>
      <Card className='h-full flex flex-col'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <span>{title}</span>
            <span className='text-sm font-normal text-muted-foreground'>({todos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='flex-1 overflow-y-auto'>
          {todos.length === 0 ? (
            <div className='text-center text-muted-foreground py-8 text-sm'>항목이 없습니다</div>
          ) : (
            <div className='space-y-2'>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  viewMode='kanban'
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ListView = ({ todos }: { todos: Todo[] }) => {
  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-center text-muted-foreground'>할 일이 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          viewMode='list'
        />
      ))}
    </>
  );
};

const KanbanView = ({
  todos,
  filter,
}: {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}) => {
  const todoItems = todos.filter((todo) => !todo.completed);
  const doneItems = todos.filter((todo) => todo.completed);

  const shouldShowTodoColumn = filter === 'all' || filter === 'active';
  const shouldShowDoneColumn = filter === 'all' || filter === 'completed';

  return (
    <div className='flex gap-4 overflow-x-auto pb-4'>
      {shouldShowTodoColumn && (
        <KanbanColumn
          title='할 일'
          todos={todoItems}
        />
      )}
      {shouldShowDoneColumn && (
        <KanbanColumn
          title='완료'
          todos={doneItems}
        />
      )}
    </div>
  );
};

export const TodoList = () => {
  const { filter, viewMode } = useTodoStore();

  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getAll,
  });

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-center text-muted-foreground'>로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-center text-destructive'>에러가 발생했습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      <TodoFilter />
      {viewMode === 'list' ? (
        <ListView todos={filteredTodos} />
      ) : (
        <KanbanView
          todos={filteredTodos}
          filter={filter}
        />
      )}
    </div>
  );
};
