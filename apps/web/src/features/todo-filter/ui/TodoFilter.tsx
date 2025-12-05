import { useTodoStore } from '@entities/todo';

import { Button } from '@/shared/ui/button/button';

export const TodoFilter = () => {
  const { filter, setFilter } = useTodoStore();

  const filters: Array<{ value: 'all' | 'active' | 'completed'; label: string }> = [
    { value: 'all', label: '전체' },
    { value: 'active', label: '진행중' },
    { value: 'completed', label: '완료' },
  ];

  return (
    <div className='flex gap-2 p-1'>
      {filters.map((f) => (
        <Button
          key={f.value}
          variant={filter === f.value ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
};
