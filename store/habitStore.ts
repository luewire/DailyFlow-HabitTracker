import { create } from 'zustand';
import { db } from '@/app/config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

// Generic Habit Log Structure
export interface HabitLog {
    id: string;
    name: string;
    time: string;
    amount: number; // e.g., minutes or hours
    unit: string;   // e.g., "min", "hours"
    timestamp: number;
}

export interface DayHabit {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    logs: HabitLog[];
    total: number;
    goal: number;
}

export interface WeeklyHabit {
    userId: string;
    weekId: string;
    habitId: string; // "meditation" | "focus" etc.
    days: DayHabit[];
}

interface HabitStore {
    habits: Record<string, WeeklyHabit | null>; // habitId -> data
    previousHabits: Record<string, WeeklyHabit | null>; // habitId -> prev week data
    loading: boolean;
    error: string | null;

    fetchHabitData: (userId: string, habitId: string, defaultGoal: number) => Promise<void>;
    fetchPreviousHabitData: (userId: string, habitId: string) => Promise<void>;
    addHabitLog: (userId: string, habitId: string, amount: number, unit: string, name: string) => Promise<void>;
    deleteHabitLog: (userId: string, habitId: string, logId: string) => Promise<void>;
    getDailyProgress: (habitId: string) => { current: number; goal: number; percentage: number; remaining: number };
    getWeeklyProgress: (habitId: string) => { day: string; completed: boolean }[];
    getWeeklyTotal: (habitId: string) => number;
}

const HABITS_COLLECTION = 'habit_logs';

const getISOWeekId = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getCurrentDayName = (): DayHabit['day'] => {
    const days: DayHabit['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getDefaultWeeklyHabit = (userId: string, habitId: string, goal: number): WeeklyHabit => {
    const days: DayHabit['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return {
        userId,
        weekId: getISOWeekId(),
        habitId,
        days: days.map(day => ({
            day,
            logs: [],
            total: 0,
            goal: goal
        }))
    };
};

export const useHabitStore = create<HabitStore>((set, get) => ({
    habits: {},
    previousHabits: {},
    loading: false,
    error: null,

    fetchHabitData: async (userId: string, habitId: string, defaultGoal: number) => {
        set({ loading: true, error: null });
        try {
            const currentWeekId = getISOWeekId();
            const docId = `${userId}_${habitId}_${currentWeekId}`;
            const habitRef = doc(db, HABITS_COLLECTION, docId);
            const habitSnap = await getDoc(habitRef);

            if (habitSnap.exists()) {
                const data = habitSnap.data() as WeeklyHabit;
                set(state => ({
                    habits: { ...state.habits, [habitId]: data },
                    loading: false
                }));
            } else {
                const newHabit = getDefaultWeeklyHabit(userId, habitId, defaultGoal);
                await setDoc(habitRef, newHabit);
                set(state => ({
                    habits: { ...state.habits, [habitId]: newHabit },
                    loading: false
                }));
            }
        } catch (error) {
            console.error(`Error fetching ${habitId} data:`, error);
            set({ error: `Failed to fetch ${habitId} data`, loading: false });
        }
    },

    fetchPreviousHabitData: async (userId: string, habitId: string) => {
        try {
            const prevDate = new Date();
            prevDate.setDate(prevDate.getDate() - 7);
            const prevWeekId = getISOWeekId(prevDate);

            const docId = `${userId}_${habitId}_${prevWeekId}`;
            const habitRef = doc(db, HABITS_COLLECTION, docId);
            const habitSnap = await getDoc(habitRef);

            if (habitSnap.exists()) {
                const data = habitSnap.data() as WeeklyHabit;
                set(state => ({
                    previousHabits: { ...state.previousHabits, [habitId]: data }
                }));
            } else {
                set(state => ({
                    previousHabits: { ...state.previousHabits, [habitId]: null }
                }));
            }
        } catch (error) {
            console.error(`Error fetching previous ${habitId} data:`, error);
        }
    },

    addHabitLog: async (userId: string, habitId: string, amount: number, unit: string, name: string) => {
        const habitData = get().habits[habitId];
        if (!habitData) return;

        try {
            const currentDayName = getCurrentDayName();
            const now = new Date();

            const newLog: HabitLog = {
                id: Date.now().toString(),
                name,
                time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                amount,
                unit,
                timestamp: now.getTime()
            };

            const updatedDays = habitData.days.map(day => {
                if (day.day === currentDayName) {
                    return {
                        ...day,
                        logs: [newLog, ...day.logs],
                        total: day.total + amount
                    };
                }
                return day;
            });

            const updatedHabitData = { ...habitData, days: updatedDays };

            // Optimistic update
            set(state => ({
                habits: { ...state.habits, [habitId]: updatedHabitData }
            }));

            const docId = `${userId}_${habitId}_${habitData.weekId}`;
            const habitRef = doc(db, HABITS_COLLECTION, docId);
            await updateDoc(habitRef, { days: updatedDays });

        } catch (error) {
            console.error(`Error adding ${habitId} entry:`, error);
            set({ error: `Failed to add ${habitId} entry` });
        }
    },

    deleteHabitLog: async (userId: string, habitId: string, logId: string) => {
        const habitData = get().habits[habitId];
        if (!habitData) return;

        try {
            const currentDayName = getCurrentDayName();

            const updatedDays = habitData.days.map(day => {
                if (day.day === currentDayName) {
                    const logToDelete = day.logs.find(l => l.id === logId);
                    if (!logToDelete) return day;

                    return {
                        ...day,
                        logs: day.logs.filter(l => l.id !== logId),
                        total: Math.max(0, day.total - logToDelete.amount)
                    };
                }
                return day;
            });

            const updatedHabitData = { ...habitData, days: updatedDays };

            set(state => ({
                habits: { ...state.habits, [habitId]: updatedHabitData }
            }));

            const docId = `${userId}_${habitId}_${habitData.weekId}`;
            const habitRef = doc(db, HABITS_COLLECTION, docId);
            await updateDoc(habitRef, { days: updatedDays });

        } catch (error) {
            console.error(`Error deleting ${habitId} entry:`, error);
            set({ error: `Failed to delete ${habitId} entry` });
        }
    },

    getDailyProgress: (habitId: string) => {
        const habitData = get().habits[habitId];
        if (!habitData) return { current: 0, goal: 0, percentage: 0, remaining: 0 };

        const currentDayName = getCurrentDayName();
        const currentDay = habitData.days.find(d => d.day === currentDayName);

        if (!currentDay) return { current: 0, goal: 0, percentage: 0, remaining: 0 };

        const percentage = Math.min(100, Math.round((currentDay.total / currentDay.goal) * 100));
        const remaining = Math.max(0, currentDay.goal - currentDay.total);

        return {
            current: currentDay.total,
            goal: currentDay.goal,
            percentage,
            remaining
        };
    },

    getWeeklyProgress: (habitId: string) => {
        const habitData = get().habits[habitId];
        if (!habitData) return [];

        const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return daysOrder.map((dayName, index) => {
            const dayData = habitData.days.find(d => d.day === dayName);
            return {
                day: dayLabels[index],
                completed: dayData ? dayData.total >= dayData.goal : false
            };
        });
    },

    getWeeklyTotal: (habitId: string) => {
        const habitData = get().habits[habitId];
        if (!habitData) return 0;

        return habitData.days.reduce((sum, day) => sum + day.total, 0);
    }
}));
