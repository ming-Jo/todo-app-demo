import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';

import { todoApi } from '@entities/todo';

import { Button, Input } from '@shared/ui';

export const TodoCreateForm = () => {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: todoApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setTitle('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createMutation.mutate({ title: title.trim() });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex gap-2'
    >
      <Input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='새로운 할 일을 입력하세요...'
        className='flex-1'
      />
      <Button
        type='submit'
        variant='outline'
        disabled={createMutation.isPending || !title.trim()}
      >
        {createMutation.isPending ? (
          <Loader2 className='w-4 h-4 mr-2 animate-spin text-sky-500' />
        ) : (
          <Plus className='w-4 h-4 mr-2' />
        )}
        추가
      </Button>
    </form>
  );
};
