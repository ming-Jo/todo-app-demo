import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi } from '@entities/todo/api/todoApi'
import { Checkbox } from '@shared/ui/checkbox'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import type { Todo } from '@entities/todo/model/types'
import { cn } from '@shared/lib/utils'

interface TodoItemProps {
  todo: Todo
}

export const TodoItem = ({ todo }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editingTitle, setEditingTitle] = useState(todo.title)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { completed?: boolean; title?: string } }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setIsEditing(false)
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

  const handleEdit = () => {
    setIsEditing(true)
    setEditingTitle(todo.title)
  }

  const handleSave = () => {
    if (editingTitle.trim() && editingTitle.trim() !== todo.title) {
      updateMutation.mutate({ id: todo.id, data: { title: editingTitle.trim() } })
    } else {
      setIsEditing(false)
      setEditingTitle(todo.title)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingTitle(todo.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <Checkbox
        checked={todo.completed}
        onChange={handleToggle}
        disabled={updateMutation.isPending || isEditing}
      />
      {isEditing ? (
        <>
          <Input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
            disabled={updateMutation.isPending}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={updateMutation.isPending || !editingTitle.trim()}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <>
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
            onClick={handleEdit}
            disabled={updateMutation.isPending || deleteMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  )
}

