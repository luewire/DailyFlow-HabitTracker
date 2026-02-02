import { create } from 'zustand';
import { Task, Priority } from '@/types';
import { db } from '@/app/config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch,
  Timestamp 
} from 'firebase/firestore';

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

const TASKS_COLLECTION = 'tasks';

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filterPriority: 'all',

  setFilterPriority: (priority) => set({ filterPriority: priority }),

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const tasksRef = collection(db, TASKS_COLLECTION);
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const userTasks: Task[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Task[];
      
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
      
      const newTaskData = {
        title,
        priority,
        completed: false,
        dueDate: dueDate || null,
        createdAt: Timestamp.now(),
        order: maxOrder + 1,
        userId,
      };

      const tasksRef = collection(db, TASKS_COLLECTION);
      const docRef = await addDoc(tasksRef, newTaskData);
      
      const newTask: Task = {
        id: docRef.id,
        ...newTaskData,
        createdAt: new Date().toISOString(),
        dueDate: dueDate,
      };
      
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
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      await updateDoc(taskRef, updates);

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
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      await deleteDoc(taskRef);

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Failed to delete task' });
    }
  },

  toggleComplete: async (taskId: string) => {
    try {
      const task = get().tasks.find((t) => t.id === taskId);
      if (!task) return;

      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      await updateDoc(taskRef, { completed: !task.completed });

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      }));
    } catch (error) {
      console.error('Error toggling task:', error);
      set({ error: 'Failed to toggle task' });
    }
  },

  reorderTasks: async (userId: string, reorderedTasks: Task[]) => {
    try {
      const batch = writeBatch(db);

      reorderedTasks.forEach((task) => {
        const taskRef = doc(db, TASKS_COLLECTION, task.id);
        batch.update(taskRef, { order: task.order });
      });

      await batch.commit();

      set({ tasks: reorderedTasks });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      set({ error: 'Failed to reorder tasks' });
    }
  },
}));
