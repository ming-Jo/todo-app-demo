import { QueryProvider } from './providers/QueryProvider';
import { TodoPage } from '@pages/todo-page/ui/TodoPage';

export const App = () => {
  return (
    <QueryProvider>
      <TodoPage />
    </QueryProvider>
  );
};
