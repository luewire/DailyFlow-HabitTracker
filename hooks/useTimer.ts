'use client';

import { useEffect } from 'react';
import { useTimerStore } from '@/store/timerStore';

export function useTimer() {
  const { isRunning, tick } = useTimerStore();

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, tick]);
}
