import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Edit2, Check, X } from 'lucide-react';

import { todoApi, type Todo } from '@entities/todo';

import { cn } from '@shared/lib/utils';
import { Checkbox, Button, Input } from '@shared/ui';

interface TodoItemProps {
  todo: Todo;
  viewMode?: 'list' | 'kanban';
}

export const TodoItem = ({ todo, viewMode = 'list' }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(todo.title);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { completed?: boolean; title?: string } }) =>
      todoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: todoApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMutation.mutate({ id: todo.id, data: { completed: e.target.checked } });
  };

  const handleDelete = () => {
    deleteMutation.mutate(todo.id);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditingTitle(todo.title);
  };

  const handleSave = () => {
    if (editingTitle.trim() && editingTitle.trim() !== todo.title) {
      updateMutation.mutate({ id: todo.id, data: { title: editingTitle.trim() } });
    } else {
      setIsEditing(false);
      setEditingTitle(todo.title);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTitle(todo.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div
      className={cn(
        'group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5',
        'shadow-sm transition-all duration-300',
        'hover:bg-accent/50 hover:border-accent-foreground/20',
        todo.completed && 'opacity-75 bg-muted/30',
      )}
    >
      {isEditing ? (
        <div className='space-y-4'>
          <Input
            type='text'
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className='w-full text-base font-medium border-2 focus:border-primary transition-colors'
            autoFocus
            disabled={updateMutation.isPending}
          />
          <div className='flex gap-2 justify-end'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleSave}
              disabled={updateMutation.isPending || !editingTitle.trim()}
              className='text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors'
            >
              <Check className='w-4 h-4 mr-1.5' />
              저장
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className='text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
            >
              <X className='w-4 h-4 mr-1.5' />
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className='relative'>
          <div
            className={cn(
              'flex items-start gap-3 transition-all',
              viewMode === 'list' && 'pr-20 group-hover:pr-20',
            )}
          >
            <div className='pt-0.5 flex-shrink-0'>
              <Checkbox
                checked={todo.completed}
                onChange={handleToggle}
                disabled={updateMutation.isPending || isEditing}
                className='transition-all'
              />
            </div>
            <span
              className={cn(
                'flex-1 text-base leading-relaxed font-medium transition-all duration-200 break-words',
                todo.completed ? 'line-through text-muted-foreground/60' : 'text-foreground',
              )}
            >
              {todo.title}
            </span>
          </div>
          {viewMode === 'list' ? (
            <div className='absolute right-0 top-0 flex gap-1 h-full items-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto'>
              <div className='flex gap-1 bg-card rounded-lg p-1 shadow-lg border border-border'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleEdit}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className='h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all'
                  title='편집'
                >
                  <Edit2 className='w-3.5 h-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all'
                  title='삭제'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-10'>
              <div className='flex gap-1 bg-card rounded-lg p-1 shadow-lg border border-border'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleEdit}
                  disabled={updateMutation.isPending || deleteMutation.isPending}
                  className='h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-all'
                  title='편집'
                >
                  <Edit2 className='w-3.5 h-3.5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className='h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all'
                  title='삭제'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
