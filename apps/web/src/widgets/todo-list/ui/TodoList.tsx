import { useQuery } from '@tanstack/react-query'
import { todoApi } from '@entities/todo/api/todoApi'
import { useTodoStore } from '@entities/todo/model/store'
import { TodoItem } from '@features/todo-item/ui/TodoItem'
import { Card, CardContent } from '@shared/ui/card'

export const TodoList = () => {
  const { filter } = useTodoStore()

  const { data: todos = [], isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: todoApi.getAll,
  })

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">에러가 발생했습니다.</p>
        </CardContent>
      </Card>
    )
  }

  if (filteredTodos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            {filter === 'all' ? '할 일이 없습니다.' : 
             filter === 'active' ? '진행 중인 할 일이 없습니다.' : 
             '완료된 할 일이 없습니다.'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}

