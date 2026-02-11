'use client';

import { Workout } from '@/types';
import { Trash2 } from 'lucide-react';

interface WorkoutItemProps {
  workout: Workout;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorkoutItem({ workout, onToggle, onDelete }: WorkoutItemProps) {
  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border-2 transition-all ${workout.completed
          ? 'border-green-500 bg-green-50'
          : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={workout.completed}
          onChange={() => onToggle(workout.id)}
          className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          <p
            className={`text-base font-medium ${workout.completed
                ? 'line-through text-gray-500'
                : 'text-gray-900'
              }`}
          >
            {workout.name}
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this workout?')) {
              onDelete(workout.id);
            }
          }}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
