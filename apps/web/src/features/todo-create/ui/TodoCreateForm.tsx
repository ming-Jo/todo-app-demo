import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todoApi } from '@entities/todo/api/todoApi'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Plus } from 'lucide-react'

export const TodoCreateForm = () => {
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setTitle('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      createMutation.mutate({ title: title.trim() })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="새로운 할 일을 입력하세요..."
        className="flex-1"
      />
      <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
        <Plus className="w-4 h-4 mr-2" />
        추가
      </Button>
    </form>
  )
}

