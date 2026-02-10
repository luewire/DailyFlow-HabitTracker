import { create } from 'zustand';
import { db } from '@/app/config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
} from 'firebase/firestore';

// Water Data Structure
export interface WaterLog {
    id: string;
    name: string;
    time: string;
    amount: number; // in ml
    timestamp: number; // for sorting
}

export interface DayWater {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    logs: WaterLog[];
    total: number; // Daily total in ml
    goal: number; // Daily goal in ml (default 2500)
}

export interface WeeklyWater {
    userId: string;
    weekId: string; // ISO week format: YYYY-Wxx
    days: DayWater[];
}

interface WaterStore {
    weeklyWater: WeeklyWater | null;
    previousWeeklyWater: WeeklyWater | null;
    monthlyWater: WeeklyWater[];
    loading: boolean;
    error: string | null;

    fetchWeeklyWater: (userId: string) => Promise<void>;
    fetchPreviousWeeklyWater: (userId: string) => Promise<void>;
    addWater: (userId: string, amount: number) => Promise<void>;
    deleteWaterLog: (userId: string, logId: string) => Promise<void>;
    getDailyProgress: () => { current: number; goal: number; percentage: number; remaining: number };
    getWeeklyProgress: () => { day: string; completed: boolean }[];
    getCurrentDayLogs: () => WaterLog[];
}

const WATER_COLLECTION = 'water_logs';
const DEFAULT_GOAL = 2500;

// Helper Functions
const getISOWeekId = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

const getCurrentDayName = (): DayWater['day'] => {
    const days: DayWater['day'][] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const getDefaultWeeklyWater = (userId: string): WeeklyWater => {
    const days: DayWater['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return {
        userId,
        weekId: getISOWeekId(),
        days: days.map(day => ({
            day,
            logs: [],
            total: 0,
            goal: DEFAULT_GOAL
        }))
    };
};

export const useWaterStore = create<WaterStore>((set, get) => ({
    weeklyWater: null,
    previousWeeklyWater: null,
    monthlyWater: [],
    loading: false,
    error: null,

    fetchWeeklyWater: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const currentWeekId = getISOWeekId();
            const waterRef = doc(db, WATER_COLLECTION, `${userId}_${currentWeekId}`);
            const waterSnap = await getDoc(waterRef);

            if (waterSnap.exists()) {
                set({ weeklyWater: waterSnap.data() as WeeklyWater, loading: false });
            } else {
                const newWater = getDefaultWeeklyWater(userId);
                await setDoc(waterRef, newWater);
                set({ weeklyWater: newWater, loading: false });
            }
        } catch (error) {
            console.error('Error fetching weekly water:', error);
            set({ error: 'Failed to fetch water data', loading: false });
        }
    },

    fetchPreviousWeeklyWater: async (userId: string) => {
        // Don't set global loading true to avoid flickering existing content
        try {
            const prevDate = new Date();
            prevDate.setDate(prevDate.getDate() - 7);
            const prevWeekId = getISOWeekId(prevDate);

            const waterRef = doc(db, WATER_COLLECTION, `${userId}_${prevWeekId}`);
            const waterSnap = await getDoc(waterRef);

            if (waterSnap.exists()) {
                set({ previousWeeklyWater: waterSnap.data() as WeeklyWater });
            } else {
                // If no data, set null or empty structure (null is fine, we'll handle it in UI)
                set({ previousWeeklyWater: null });
            }
        } catch (error) {
            console.error('Error fetching previous weekly water:', error);
            // Silent error for secondary data
        }
    },

    addWater: async (userId: string, amount: number) => {
        const { weeklyWater } = get();
        if (!weeklyWater) return;

        try {
            const currentDayName = getCurrentDayName();
            const now = new Date();

            const newLog: WaterLog = {
                id: Date.now().toString(),
                name: amount === 250 ? 'Small Cup' : amount === 500 ? 'Glass of Water' : 'Water',
                time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
                amount,
                timestamp: now.getTime()
            };

            const updatedDays = weeklyWater.days.map(day => {
                if (day.day === currentDayName) {
                    return {
                        ...day,
                        logs: [newLog, ...day.logs],
                        total: day.total + amount
                    };
                }
                return day;
            });

            const updatedWeeklyWater = { ...weeklyWater, days: updatedDays };

            // Optimistic update
            set({ weeklyWater: updatedWeeklyWater });

            const waterRef = doc(db, WATER_COLLECTION, `${userId}_${weeklyWater.weekId}`);
            await updateDoc(waterRef, { days: updatedDays });

        } catch (error) {
            console.error('Error adding water:', error);
            set({ error: 'Failed to add water log' });
            // Revert optimistic update ideally, but for now just logging error
            get().fetchWeeklyWater(userId);
        }
    },

    deleteWaterLog: async (userId: string, logId: string) => {
        const { weeklyWater } = get();
        if (!weeklyWater) return;

        try {
            const currentDayName = getCurrentDayName();

            const updatedDays = weeklyWater.days.map(day => {
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

            const updatedWeeklyWater = { ...weeklyWater, days: updatedDays };

            set({ weeklyWater: updatedWeeklyWater });

            const waterRef = doc(db, WATER_COLLECTION, `${userId}_${weeklyWater.weekId}`);
            await updateDoc(waterRef, { days: updatedDays });

        } catch (error) {
            console.error('Error deleting water log:', error);
            set({ error: 'Failed to delete water log' });
            get().fetchWeeklyWater(userId);
        }
    },

    getDailyProgress: () => {
        const { weeklyWater } = get();
        if (!weeklyWater) return { current: 0, goal: DEFAULT_GOAL, percentage: 0, remaining: DEFAULT_GOAL };

        const currentDayName = getCurrentDayName();
        const currentDay = weeklyWater.days.find(d => d.day === currentDayName);

        if (!currentDay) return { current: 0, goal: DEFAULT_GOAL, percentage: 0, remaining: DEFAULT_GOAL };

        const currentLiters = currentDay.total / 1000;
        const goalLiters = currentDay.goal / 1000;
        const percentage = Math.min(100, Math.round((currentDay.total / currentDay.goal) * 100));
        const remaining = Math.max(0, currentDay.goal - currentDay.total);

        return {
            current: currentLiters,
            goal: goalLiters,
            percentage,
            remaining
        };
    },

    getWeeklyProgress: () => {
        const { weeklyWater } = get();
        if (!weeklyWater) return [];

        const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return daysOrder.map((dayName, index) => {
            const dayData = weeklyWater.days.find(d => d.day === dayName);
            return {
                day: dayLabels[index],
                completed: dayData ? dayData.total >= dayData.goal : false
            };
        });
    },

    getCurrentDayLogs: () => {
        const { weeklyWater } = get();
        if (!weeklyWater) return [];

        const currentDayName = getCurrentDayName();
        const currentDay = weeklyWater.days.find(d => d.day === currentDayName);

        return currentDay ? currentDay.logs : [];
    }
}));
