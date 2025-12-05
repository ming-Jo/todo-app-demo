import { TodoCreateForm } from '@features/todo-create/ui/TodoCreateForm'
import { TodoFilter } from '@features/todo-filter/ui/TodoFilter'
import { TodoList } from '@widgets/todo-list/ui/TodoList'
import { Card, CardHeader, CardTitle, CardContent } from '@shared/ui/card'

export const TodoPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Todo App</CardTitle>
          </CardHeader>
          <CardContent>
            <TodoCreateForm />
            <TodoFilter />
            <TodoList />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

