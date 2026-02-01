import { create } from 'zustand';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';

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
  completedExercises: string[]; // exerciseId array (Firestore doesn't support Set)
}

interface WorkoutStore {
  weeklyWorkout: WeeklyWorkout | null;
  loading: boolean;
  error: string | null;
  fetchWeeklyWorkout: (userId: string) => Promise<void>;
  toggleExercise: (exerciseId: string) => Promise<void>;
  getWeeklyProgress: () => { completed: number; total: number; percentage: number };
  getCurrentDayWorkout: () => DayWorkout | null;
  resetWeeklyWorkout: (userId: string) => Promise<void>;
}

const WORKOUTS_COLLECTION = 'workouts';

// Helper functions
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
    completedExercises: [],
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
          { id: 'fri-4', name: 'Squat jump', sets: '3', reps: '12' },
          { id: 'fri-5', name: 'Plank', sets: '3', reps: '45 detik' },
        ],
      },
      {
        day: 'Saturday',
        exercises: [
          { id: 'sat-1', name: 'Wide grip pull-up', sets: '3', reps: 'max' },
          { id: 'sat-2', name: 'Archer push-up', sets: '3', reps: '8/sisi' },
          { id: 'sat-3', name: 'Inverted rows', sets: '3', reps: '12' },
          { id: 'sat-4', name: 'Decline push-up', sets: '3', reps: '10-12' },
          { id: 'sat-5', name: 'Hanging L-sit', sets: '3', reps: '20 detik' },
        ],
      },
      {
        day: 'Sunday',
        exercises: [
          { id: 'sun-1', name: 'Yoga/Stretching', sets: '1', reps: '20 menit' },
          { id: 'sun-2', name: 'Light walk', sets: '1', reps: '30 menit' },
          { id: 'sun-3', name: 'Foam rolling', sets: '1', reps: '10 menit' },
        ],
      },
    ],
  };
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  weeklyWorkout: null,
  loading: false,
  error: null,

  fetchWeeklyWorkout: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const currentWeekId = getISOWeekId();
      const workoutRef = doc(db, WORKOUTS_COLLECTION, `${userId}_${currentWeekId}`);
      const workoutSnap = await getDoc(workoutRef);

      if (workoutSnap.exists()) {
        const data = workoutSnap.data() as WeeklyWorkout;
        set({ weeklyWorkout: data, loading: false });
      } else {
        // Create new workout for this week
        const newWorkout = getDefaultWeeklyWorkout(userId);
        await setDoc(workoutRef, newWorkout);
        set({ weeklyWorkout: newWorkout, loading: false });
      }
    } catch (error) {
      console.error('Error fetching weekly workout:', error);
      set({ error: 'Failed to fetch workout', loading: false });
    }
  },

  toggleExercise: async (exerciseId: string) => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return;

    try {
      const completedSet = new Set(weeklyWorkout.completedExercises);
      
      if (completedSet.has(exerciseId)) {
        completedSet.delete(exerciseId);
      } else {
        completedSet.add(exerciseId);
      }

      const updatedCompleted = Array.from(completedSet);
      const workoutRef = doc(db, WORKOUTS_COLLECTION, `${weeklyWorkout.userId}_${weeklyWorkout.weekId}`);
      
      await updateDoc(workoutRef, {
        completedExercises: updatedCompleted,
      });

      set({
        weeklyWorkout: {
          ...weeklyWorkout,
          completedExercises: updatedCompleted,
        },
      });
    } catch (error) {
      console.error('Error toggling exercise:', error);
      set({ error: 'Failed to toggle exercise' });
    }
  },

  getWeeklyProgress: () => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return { completed: 0, total: 0, percentage: 0 };

    const totalExercises = weeklyWorkout.workouts.reduce(
      (sum, day) => sum + day.exercises.length,
      0
    );
    const completedCount = weeklyWorkout.completedExercises.length;
    const percentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

    return {
      completed: completedCount,
      total: totalExercises,
      percentage: Math.round(percentage),
    };
  },

  getCurrentDayWorkout: () => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return null;

    const currentDay = getCurrentDay();
    return weeklyWorkout.workouts.find((w) => w.day === currentDay) || null;
  },

  resetWeeklyWorkout: async (userId: string) => {
    try {
      const currentWeekId = getISOWeekId();
      const newWorkout = getDefaultWeeklyWorkout(userId);
      const workoutRef = doc(db, WORKOUTS_COLLECTION, `${userId}_${currentWeekId}`);
      
      await setDoc(workoutRef, newWorkout);
      set({ weeklyWorkout: newWorkout });
    } catch (error) {
      console.error('Error resetting workout:', error);
      set({ error: 'Failed to reset workout' });
    }
  },
}));
