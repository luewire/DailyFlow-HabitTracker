import { create } from 'zustand';
import { db } from '@/app/config/firebase';
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
  previousWeeklyWorkout: WeeklyWorkout | null;
  monthlyWorkouts: WeeklyWorkout[];
  loading: boolean;
  error: string | null;
  fetchWeeklyWorkout: (userId: string) => Promise<void>;
  fetchPreviousWeeklyWorkout: (userId: string) => Promise<void>;
  fetchMonthlyWorkouts: (userId: string) => Promise<void>;
  toggleExercise: (exerciseId: string) => Promise<void>;
  getWeeklyProgress: () => { completed: number; total: number; percentage: number };
  getMonthlyProgress: () => { completed: number; total: number; percentage: number; weeks: { weekId: string; completed: number; total: number; percentage: number }[] };
  getDailyProgress: () => { day: string; completed: number; total: number; percentage: number; exercises?: Exercise[] }[];
  getCurrentDayWorkout: () => DayWorkout | null;
  resetWeeklyWorkout: (userId: string) => Promise<void>;
}

const WORKOUTS_COLLECTION = 'workouts';

// Helper functions
const getISOWeekId = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getCurrentMonthWeeks = (): string[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const weeks: string[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Find the first week of the month
  const firstWeekStart = new Date(firstDay);
  firstWeekStart.setDate(firstDay.getDate() - firstDay.getDay());

  // Generate all weeks in the month
  let currentWeek = new Date(firstWeekStart);
  while (currentWeek <= lastDay) {
    const weekYear = currentWeek.getFullYear();
    const firstDayOfYear = new Date(weekYear, 0, 1);
    const pastDaysOfYear = (currentWeek.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    weeks.push(`${weekYear}-W${String(weekNumber).padStart(2, '0')}`);

    currentWeek.setDate(currentWeek.getDate() + 7);
  }

  return weeks;
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
          { id: 'mon-1', name: 'Pull Up', sets: '4', reps: 'semampunya (target 6–12)' },
          { id: 'mon-2', name: 'Chin Up', sets: '3', reps: 'semampunya' },
          { id: 'mon-3', name: 'Negative Pull Up', sets: '3', reps: '6' },
          { id: 'mon-4', name: 'Dead Hang', sets: '3', reps: '30–45 detik' },
        ],
      },
      {
        day: 'Tuesday',
        exercises: [
          { id: 'tue-1', name: 'Push Up', sets: '4', reps: '15' },
          { id: 'tue-2', name: 'Decline Push Up', sets: '3', reps: '12' },
          { id: 'tue-3', name: 'Diamond Push Up', sets: '3', reps: '10' },
          { id: 'tue-4', name: 'Pike Push Up', sets: '3', reps: '10' },
        ],
      },
      {
        day: 'Wednesday',
        exercises: [
          { id: 'wed-1', name: 'Squat', sets: '4', reps: '20' },
          { id: 'wed-2', name: 'Walking Lunges', sets: '3', reps: '20 langkah' },
          { id: 'wed-3', name: 'Bulgarian Split Squat', sets: '3', reps: '12 per kaki' },
          { id: 'wed-4', name: 'Calf Raise', sets: '4', reps: '25' },
        ],
      },
      {
        day: 'Thursday',
        exercises: [
          { id: 'thu-1', name: 'Hanging Knee Raise', sets: '4', reps: '12' },
          { id: 'thu-2', name: 'Leg Raise', sets: '3', reps: '15' },
          { id: 'thu-3', name: 'Russian Twist', sets: '3', reps: '20' },
          { id: 'thu-4', name: 'Plank', sets: '3', reps: '45 detik' },
        ],
      },
      {
        day: 'Friday',
        exercises: [
          { id: 'fri-1', name: 'Pull Up', sets: '4', reps: 'semampunya' },
          { id: 'fri-2', name: 'Explosive Push Up', sets: '3', reps: '12' },
          { id: 'fri-3', name: 'Close Grip Chin Up', sets: '3', reps: 'semampunya' },
          { id: 'fri-4', name: 'Slow Push Up (3 detik turun)', sets: '3', reps: '10' },
        ],
      },
      {
        day: 'Saturday',
        exercises: [
          { id: 'sat-1', name: 'Mountain Climbers', sets: '3', reps: '40 detik' },
          { id: 'sat-2', name: 'Flutter Kick', sets: '3', reps: '30 detik' },
          { id: 'sat-3', name: 'Burpees', sets: '3', reps: '12' },
          { id: 'sat-4', name: 'Hanging Leg Raise', sets: '3', reps: '10' },
        ],
      },
      {
        day: 'Sunday',
        exercises: [
          { id: 'sun-1', name: 'Rest / Stretching', sets: '1', reps: 'Full Recovery' },
        ],
      },
    ],
  };
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  weeklyWorkout: null,
  previousWeeklyWorkout: null,
  monthlyWorkouts: [],
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

  fetchPreviousWeeklyWorkout: async (userId: string) => {
    try {
      const prevDate = new Date();
      prevDate.setDate(prevDate.getDate() - 7);
      const prevWeekId = getISOWeekId(prevDate);

      const workoutRef = doc(db, WORKOUTS_COLLECTION, `${userId}_${prevWeekId}`);
      const workoutSnap = await getDoc(workoutRef);

      if (workoutSnap.exists()) {
        const data = workoutSnap.data() as WeeklyWorkout;
        set({ previousWeeklyWorkout: data });
      } else {
        set({ previousWeeklyWorkout: null });
      }
    } catch (error) {
      console.error('Error fetching previous weekly workout:', error);
    }
  },

  fetchMonthlyWorkouts: async (userId: string) => {
    try {
      const monthWeeks = getCurrentMonthWeeks();
      const workouts: WeeklyWorkout[] = [];

      for (const weekId of monthWeeks) {
        const workoutRef = doc(db, WORKOUTS_COLLECTION, `${userId}_${weekId}`);
        const workoutSnap = await getDoc(workoutRef);

        if (workoutSnap.exists()) {
          workouts.push(workoutSnap.data() as WeeklyWorkout);
        } else {
          // Create default workout for past weeks
          const defaultWorkout = getDefaultWeeklyWorkout(userId);
          defaultWorkout.weekId = weekId;
          workouts.push(defaultWorkout);
        }
      }

      set({ monthlyWorkouts: workouts });
    } catch (error) {
      console.error('Error fetching monthly workouts:', error);
      set({ error: 'Failed to fetch monthly workouts' });
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

  getMonthlyProgress: () => {
    const { monthlyWorkouts } = get();
    if (monthlyWorkouts.length === 0) return { completed: 0, total: 0, percentage: 0, weeks: [] };

    let totalCompleted = 0;
    let totalExercises = 0;
    const weeks = monthlyWorkouts.map(workout => {
      const weekTotal = workout.workouts.reduce((sum, day) => sum + day.exercises.length, 0);
      const weekCompleted = workout.completedExercises.length;
      const weekPercentage = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

      totalCompleted += weekCompleted;
      totalExercises += weekTotal;

      return {
        weekId: workout.weekId,
        completed: weekCompleted,
        total: weekTotal,
        percentage: Math.round(weekPercentage),
      };
    });

    const percentage = totalExercises > 0 ? (totalCompleted / totalExercises) * 100 : 0;

    return {
      completed: totalCompleted,
      total: totalExercises,
      percentage: Math.round(percentage),
      weeks,
    };
  },

  getDailyProgress: () => {
    const { weeklyWorkout } = get();
    if (!weeklyWorkout) return [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return days.map((day, index) => {
      const dayWorkout = weeklyWorkout.workouts.find(w => w.day === day);
      if (!dayWorkout) {
        return { day: dayLabels[index], completed: 0, total: 0, percentage: 0 };
      }

      const totalExercises = dayWorkout.exercises.length;
      const completedExercises = dayWorkout.exercises.filter(exercise =>
        weeklyWorkout.completedExercises.includes(exercise.id)
      ).length;

      const percentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

      return {
        day: dayLabels[index],
        completed: completedExercises,
        total: totalExercises,
        percentage: Math.round(percentage),
        exercises: dayWorkout.exercises
      };
    });
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
