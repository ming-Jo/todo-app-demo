import { useTodoStore } from '@entities/todo/model/store';
import { Button } from '@shared/ui/button';
import { List, LayoutGrid } from 'lucide-react';
import { cn } from '@shared/lib/utils';

export const TodoViewToggle = () => {
  const { viewMode, setViewMode } = useTodoStore();

  return (
    <div className='flex gap-2 border rounded-lg p-1 bg-muted/50'>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setViewMode('list')}
        className={cn('flex items-center gap-2', viewMode === 'list' && 'shadow-sm')}
      >
        <List className='w-4 h-4' />
        <span>리스트</span>
      </Button>
      <Button
        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => setViewMode('kanban')}
        className={cn('flex items-center gap-2', viewMode === 'kanban' && 'shadow-sm')}
      >
        <LayoutGrid className='w-4 h-4' />
        <span>칸반</span>
      </Button>
    </div>
  );
};
