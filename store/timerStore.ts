import { create } from 'zustand';
import { TimerMode, TimerState } from '@/types';

interface TimerStore extends TimerState {
  sessionCount: number;
  showAlarm: boolean;
  setDuration: (minutes: number) => void;
  adjustTime: (minutesDelta: number, secondsDelta: number) => void;
  setLinkedTask: (taskId?: string) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  startBreak: () => void;
  incrementSessionCount: () => void;
  snooze: (minutes: number) => void;
  dismissAlarm: () => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: 'idle',
  duration: 25 * 60, // 25 minutes in seconds
  remaining: 25 * 60,
  isRunning: false,
  linkedTaskId: undefined,
  sessionCount: 0,
  showAlarm: false,

  setDuration: (minutes: number) => {
    const seconds = minutes * 60;
    set({
      duration: seconds,
      remaining: seconds,
      mode: 'focus',
      isRunning: false,
    });
  },

  adjustTime: (minutesDelta: number, secondsDelta: number) => {
    const { remaining, isRunning } = get();
    if (isRunning) return;
    
    const currentMinutes = Math.floor(remaining / 60);
    const currentSeconds = remaining % 60;
    
    let newMinutes = currentMinutes + minutesDelta;
    let newSeconds = currentSeconds + secondsDelta;
    
    // Handle seconds overflow/underflow
    if (newSeconds >= 60) {
      newMinutes += Math.floor(newSeconds / 60);
      newSeconds = newSeconds % 60;
    } else if (newSeconds < 0) {
      newMinutes -= 1;
      newSeconds = 60 + newSeconds;
    }
    
    // Ensure non-negative
    if (newMinutes < 0) newMinutes = 0;
    if (newSeconds < 0) newSeconds = 0;
    
    // Max 180 minutes
    if (newMinutes > 180) {
      newMinutes = 180;
      newSeconds = 0;
    }
    
    const totalSeconds = newMinutes * 60 + newSeconds;
    set({
      duration: totalSeconds,
      remaining: totalSeconds,
      mode: totalSeconds > 0 ? 'focus' : 'idle',
    });
  },

  setLinkedTask: (taskId?: string) => {
    set({ linkedTaskId: taskId });
  },

  start: () => {
    set({ isRunning: true });
  },

  pause: () => {
    set({ isRunning: false });
  },

  reset: () => {
    const { duration } = get();
    set({
      remaining: duration,
      isRunning: false,
      mode: 'idle',
      linkedTaskId: undefined,
    });
  },

  tick: () => {
    const { remaining, isRunning, mode } = get();
    
    if (!isRunning) return;
    
    if (remaining <= 0) {
      if (mode === 'focus') {
        // Focus session complete, show alarm
        set({ isRunning: false, showAlarm: true });
        get().incrementSessionCount();
      } else {
        // Break complete
        set({ isRunning: false, mode: 'idle', showAlarm: true });
      }
      return;
    }

    set({ remaining: remaining - 1 });
  },

  startBreak: () => {
    const breakDuration = 5 * 60; // 5 minutes
    set({
      mode: 'break',
      duration: breakDuration,
      remaining: breakDuration,
      isRunning: true,
      linkedTaskId: undefined,
    });
  },

  incrementSessionCount: () => {
    set((state) => ({ sessionCount: state.sessionCount + 1 }));
  },

  snooze: (minutes: number) => {
    const seconds = minutes * 60;
    set({
      duration: seconds,
      remaining: seconds,
      isRunning: true,
      showAlarm: false,
      mode: 'focus',
    });
  },

  dismissAlarm: () => {
    set({ showAlarm: false });
  },
}));
