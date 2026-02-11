'use client';

import { Task } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Trash2, GripVertical, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  // Simple icon mapping based on task title
  const getTaskIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('groceries') || lowerTitle.includes('buy')) {
      return <ShoppingBag size={16} />;
    }
    return null;
  };

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 ${task.completed ? 'opacity-50' : ''
        }`}
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center mt-0.5">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="cursor-pointer"
          />
        </div>

        {/* Icon */}
        {getTaskIcon(task.title) && (
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{
              background: 'rgba(90, 125, 94, 0.2)',
              color: 'var(--text-secondary)',
            }}
          >
            {getTaskIcon(task.title)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium ${task.completed ? 'line-through' : ''
              }`}
            style={{
              color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            {task.title}
          </p>

          {task.dueDate && (
            <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>
              Due: {format(new Date(task.dueDate), 'h:mm a')}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              onDelete(task.id);
            }
          }}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
