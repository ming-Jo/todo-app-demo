import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi } from '@entities/todo/api/todoApi'
import { Checkbox } from '@shared/ui/checkbox'
import { Button } from '@shared/ui/button'
import { Trash2 } from 'lucide-react'
import type { Todo } from '@entities/todo/model/types'
import { cn } from '@shared/lib/utils'

interface TodoItemProps {
  todo: Todo
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { completed: boolean } }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMutation.mutate({ id: todo.id, data: { completed: e.target.checked } })
  }

  const handleDelete = () => {
    deleteMutation.mutate(todo.id)
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={todo.completed}
        onChange={handleToggle}
        disabled={updateMutation.isPending}
      />
      <span
        className={cn(
          'flex-1 text-sm',
          todo.completed && 'line-through text-muted-foreground'
        )}
      >
        {todo.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

