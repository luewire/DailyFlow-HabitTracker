export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  order: number;
  userId: string;
}

export interface Workout {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
  userId: string;
}

export interface FocusSession {
  id: string;
  duration: number; // in minutes
  taskId?: string;
  startedAt: string;
  completedAt?: string;
  userId: string;
  date: string; // YYYY-MM-DD format for grouping
}

export type TimerMode = 'focus' | 'break' | 'idle';

export interface TimerState {
  mode: TimerMode;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
  linkedTaskId?: string;
}
