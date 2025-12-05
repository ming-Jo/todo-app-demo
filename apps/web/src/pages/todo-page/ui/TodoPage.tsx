import { TodoList } from '@widgets/todo-list';

import { TodoCreateForm } from '@features/todo-create';
import { TodoViewToggle } from '@features/todo-view-toggle';

import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui';

export const TodoPage = () => {
  return (
    <div className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Todo App</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoCreateForm />
          </CardContent>
        </Card>
        <div className='flex flex-col gap-2'>
          <TodoViewToggle />
          <TodoList />
        </div>
      </div>
    </div>
  );
};
