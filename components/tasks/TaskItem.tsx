'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center mt-1">
          <GripVertical size={20} className="text-gray-400 mr-2 cursor-grab" />
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task.id)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-base font-medium ${
              task.completed
                ? 'line-through text-gray-500'
                : 'text-gray-900'
            }`}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="text-xs text-gray-500">
                Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
