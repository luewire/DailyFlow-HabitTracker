'use client';

import { Button } from '@/components/ui/Button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  mode: 'focus' | 'break' | 'idle';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  mode,
  onStart,
  onPause,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {!isRunning ? (
        <Button
          onClick={onStart}
          size="lg"
          className="flex items-center gap-2"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6" />
          Start
        </Button>
      ) : (
        <Button
          onClick={onPause}
          size="lg"
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
          Pause
        </Button>
      )}

      <Button
        onClick={onReset}
        size="lg"
        variant="ghost"
        className="flex items-center gap-2"
      >
        <RotateCcw size={20} />
        Reset
      </Button>
    </div>
  );
}
