import { create } from 'zustand';
import { Task, Priority } from '@/types';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filterPriority: Priority | 'all';
  setFilterPriority: (priority: Priority | 'all') => void;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, title: string, priority: Priority, dueDate?: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  reorderTasks: (userId: string, reorderedTasks: Task[]) => Promise<void>;
}

// Helper functions for localStorage
const STORAGE_KEY = 'dailyflow_tasks';

const getTasksFromStorage = (): Task[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTasksToStorage = (tasks: Task[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filterPriority: 'all',

  setFilterPriority: (priority) => set({ filterPriority: priority }),

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const allTasks = getTasksFromStorage();
      const userTasks = allTasks.filter(task => task.userId === userId);
      
      set({ tasks: userTasks, loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: 'Failed to fetch tasks', loading: false });
    }
  },

  addTask: async (userId: string, title: string, priority: Priority, dueDate?: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = get().tasks;
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) : 0;
      
      const newTask: Task = {
        id: Date.now().toString(),
        title,
        priority,
        completed: false,
        dueDate: dueDate || undefined,
        createdAt: new Date().toISOString(),
        order: maxOrder + 1,
        userId,
      };

      const allTasks = getTasksFromStorage();
      allTasks.push(newTask);
      saveTasksToStorage(allTasks);
      
      set((state) => ({
        tasks: [...state.tasks, newTask],
        loading: false,
      }));
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: 'Failed to add task', loading: false });
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    try {
      const allTasks = getTasksFromStorage();
      const taskIndex = allTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        allTasks[taskIndex] = { ...allTasks[taskIndex], ...updates };
        saveTasksToStorage(allTasks);
      }

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates } : t
        ),
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: 'Failed to update task' });
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      const allTasks = getTasksFromStorage();
      const filteredTasks = allTasks.filter(t => t.id !== taskId);
      saveTasksToStorage(filteredTasks);

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Failed to delete task' });
    }
  },

  toggleComplete: async (taskId: string) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    await get().updateTask(taskId, { completed: !task.completed });
  },

  reorderTasks: async (userId: string, reorderedTasks: Task[]) => {
    try {
      // Update order in state immediately for smooth UX
      set({ tasks: reorderedTasks });

      // Update in localStorage
      const allTasks = getTasksFromStorage();
      const otherUserTasks = allTasks.filter(t => t.userId !== userId);
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }));
      
      saveTasksToStorage([...otherUserTasks, ...updatedTasks]);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      set({ error: 'Failed to reorder tasks' });
    }
  },
}));
