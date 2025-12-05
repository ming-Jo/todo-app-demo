import { TodoPage } from '@pages/todo-page';

import { QueryProvider } from './providers/QueryProvider';

export const App = () => {
  return (
    <QueryProvider>
      <TodoPage />
    </QueryProvider>
  );
};
