import { create } from 'zustand';

// Weekly workout structure
export interface Exercise {
  id: string;
  name: string;
  sets?: string;
  reps?: string;
}

export interface DayWorkout {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  exercises: Exercise[];
}

export interface WeeklyWorkout {
  userId: string;
  weekId: string; // ISO week format: YYYY-Wxx
  workouts: DayWorkout[];
  completedExercises: Set<string>; // exerciseId set
}

interface WorkoutStore {
  weeklyWorkout: WeeklyWorkout | null;
  loading: boolean;
  error: string | null;
  fetchWeeklyWorkout: (userId: string) => Promise<void>;
  toggleExercise: (exerciseId: string) => void;
  getWeeklyProgress: () => { completed: number; total: number; percentage: number };
  getCurrentDayWorkout: () => DayWorkout | null;
  resetWeeklyWorkout: (userId: string) => void;
}

// Helper functions
const STORAGE_KEY = 'dailyflow_weekly_workout';

const getISOWeekId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getCurrentDay = (): DayWorkout['day'] => {
  const days: DayWorkout['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getDefaultWeeklyWorkout = (userId: string): WeeklyWorkout => {
  return {
    userId,
    weekId: getISOWeekId(),
    completedExercises: new Set(),
    workouts: [
      {
        day: 'Monday',
        exercises: [
          { id: 'mon-1', name: 'Push-up', sets: '4', reps: '12-15' },
          { id: 'mon-2', name: 'Pike push-up', sets: '3', reps: '10-12' },
          { id: 'mon-3', name: 'Diamond push-up', sets: '3', reps: '8-10' },
          { id: 'mon-4', name: 'Tricep dips (pakai kursi)', sets: '3', reps: '12-15' },
        ],
      },
      {
        day: 'Tuesday',
        exercises: [
          { id: 'tue-1', name: 'Pull-up', sets: '4', reps: 'max' },
          { id: 'tue-2', name: 'Chin-up', sets: '3', reps: 'max' },
          { id: 'tue-3', name: 'Australian pull-up (low bar)', sets: '3', reps: '12-15' },
          { id: 'tue-4', name: 'Hanging knee raises', sets: '3', reps: '12-15' },
        ],
      },
      {
        day: 'Wednesday',
        exercises: [
          { id: 'wed-1', name: 'Squat', sets: '4', reps: '20' },
          { id: 'wed-2', name: 'Bulgarian split squat', sets: '3', reps: '12/kaki' },
          { id: 'wed-3', name: 'Lunges', sets: '3', reps: '15/kaki' },
          { id: 'wed-4', name: 'Calf raises', sets: '4', reps: '20' },
          { id: 'wed-5', name: 'Glute bridge', sets: '3', reps: '15' },
        ],
      },
      {
        day: 'Thursday',
        exercises: [
          { id: 'thu-1', name: 'Plank', sets: '3', reps: '60 detik' },
          { id: 'thu-2', name: 'Hanging leg raises', sets: '3', reps: '10-12' },
          { id: 'thu-3', name: 'Bicycle crunches', sets: '3', reps: '20' },
          { id: 'thu-4', name: 'Russian twist', sets: '3', reps: '30' },
          { id: 'thu-5', name: 'Mountain climbers', sets: '3', reps: '20' },
        ],
      },
      {
        day: 'Friday',
        exercises: [
          { id: 'fri-1', name: 'Burpees', sets: '3', reps: '10' },
          { id: 'fri-2', name: 'Pull-up', sets: '3', reps: '8' },
          { id: 'fri-3', name: 'Push-up', sets: '3', reps: '15' },
          { id: 'fri-4', name: 'Jump squat', sets: '3', reps: '15' },
          { id: 'fri-5', name: 'Plank', sets: '3', reps: '45 detik' },
        ],
      },
      {
        day: 'Saturday',
        exercises: [
          { id: 'sat-1', name: 'Wide grip pull-up', sets: '4', reps: 'max' },
          { id: 'sat-2', name: 'Close grip chin-up', sets: '3', reps: 'max' },
          { id: 'sat-3', name: 'Inverted row', sets: '3', reps: '12' },
          { id: 'sat-4', name: 'Pike push-up', sets: '3', reps: '10' },
          { id: 'sat-5', name: 'Hanging hold', sets: '3', reps: '30-45 detik' },
        ],
      },
      {
        day: 'Sunday',
        exercises: [
          { id: 'sun-1', name: 'Yoga Flow', sets: '1', reps: '15min' },
          { id: 'sun-2', name: 'Stretching', sets: '1', reps: '10min' },
          { id: 'sun-3', name: 'Light Cardio', sets: '1', reps: '20min' },
        ],
      },
    ],
  };
};

const getWeeklyWorkoutFromStorage = (): WeeklyWorkout | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  // Convert completedExercises array back to Set
  parsed.completedExercises = new Set(parsed.completedExercises || []);
  return parsed;
};

const saveWeeklyWorkoutToStorage = (workout: WeeklyWorkout) => {
  if (typeof window !== 'undefined') {
    // Convert Set to array for JSON serialization
    const toSave = {
      ...workout,
      completedExercises: Array.from(workout.completedExercises),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  weeklyWorkout: null,
  loading: false,
  error: null,

  fetchWeeklyWorkout: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let weeklyWorkout = getWeeklyWorkoutFromStorage();
      const currentWeekId = getISOWeekId();
      
      // Check if need to reset for new week
      if (!weeklyWorkout || weeklyWorkout.userId !== userId || weeklyWorkout.weekId !== currentWeekId) {
        weeklyWorkout = getDefaultWeeklyWorkout(userId);
        saveWeeklyWorkoutToStorage(weeklyWorkout);
      }
      
      set({ weeklyWorkout, loading: false });
    } catch (error) {
      console.error('Error fetching weekly workout:', error);
      set({ error: 'Failed to fetch weekly workout', loading: false });
    }
  },

  toggleExercise: (exerciseId: string) => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return;

    const newCompleted = new Set(weeklyWorkout.completedExercises);
    if (newCompleted.has(exerciseId)) {
      newCompleted.delete(exerciseId);
    } else {
      newCompleted.add(exerciseId);
    }

    const updated = {
      ...weeklyWorkout,
      completedExercises: newCompleted,
    };

    saveWeeklyWorkoutToStorage(updated);
    set({ weeklyWorkout: updated });
  },

  getWeeklyProgress: () => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return { completed: 0, total: 0, percentage: 0 };

    const totalExercises = weeklyWorkout.workouts.reduce(
      (sum, day) => sum + day.exercises.length,
      0
    );
    const completedExercises = weeklyWorkout.completedExercises.size;
    const percentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return {
      completed: completedExercises,
      total: totalExercises,
      percentage,
    };
  },

  getCurrentDayWorkout: () => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return null;

    const currentDay = getCurrentDay();
    return weeklyWorkout.workouts.find(w => w.day === currentDay) || null;
  },

  resetWeeklyWorkout: (userId: string) => {
    const weeklyWorkout = getDefaultWeeklyWorkout(userId);
    saveWeeklyWorkoutToStorage(weeklyWorkout);
    set({ weeklyWorkout });
  },
}));
