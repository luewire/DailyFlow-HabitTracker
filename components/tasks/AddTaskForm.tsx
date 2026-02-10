'use client';

import { useState } from 'react';
import { Priority } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';

interface AddTaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate?: string) => void;
  onCancel: () => void;
}

export function AddTaskForm({ onAdd, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, priority, dueDate || undefined);
      setTitle('');
      setPriority('medium');
      setDueDate('');
      onCancel();
    }
  };

  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Add New Task
        </h3>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
          autoFocus
        />

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Priority
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all border"
                style={{
                  background: priority === p ? 'rgba(0, 230, 118, 0.15)' : 'var(--bg-card)',
                  borderColor: priority === p ? 'var(--accent-green)' : 'var(--border-subtle)',
                  color: priority === p ? 'var(--accent-green)' : 'var(--text-secondary)',
                }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Add Task
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
