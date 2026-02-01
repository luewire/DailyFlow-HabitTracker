'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/store/taskStore';
import { useTimerStore } from '@/store/timerStore';
import { useTimer } from '@/hooks/useTimer';
import { TimerDisplay } from '@/components/focus/TimerDisplay';
import { TimerControls } from '@/components/focus/TimerControls';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { Button } from '@/components/ui/Button';
import { Clock } from 'lucide-react';
import { playAlarmSound, requestNotificationPermission } from '@/utils/alarm';

const PRESET_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '25 min', minutes: 25 },
  { label: '45 min', minutes: 45 },
];

export default function FocusPage() {
  const { user } = useAuth();
  const { tasks, fetchTasks } = useTaskStore();
  const {
    mode,
    duration,
    remaining,
    isRunning,
    linkedTaskId,
    sessionCount,
    showAlarm,
    setDuration,
    adjustTime,
    setLinkedTask,
    start,
    pause,
    reset,
    snooze,
    dismissAlarm,
  } = useTimerStore();

  const [showTaskSelector, setShowTaskSelector] = useState(false);

  useTimer(); // Start timer interval

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Play alarm sound when showAlarm becomes true
  useEffect(() => {
    if (showAlarm) {
      playAlarmSound();
    }
  }, [showAlarm]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const handlePresetSelect = (mins: number) => {
    if (!isRunning) {
      setDuration(mins);
    }
  };

  const handleAdjustMinutes = (delta: number) => {
    adjustTime(delta, 0);
  };

  const handleAdjustSeconds = (delta: number) => {
    adjustTime(0, delta);
  };

  const handleTaskSelect = (taskId: string) => {
    setLinkedTask(taskId);
    setShowTaskSelector(false);
  };

  const linkedTask = linkedTaskId ? tasks.find(t => t.id === linkedTaskId) : null;
  const incompleteTasks = tasks.filter(t => !t.completed);

  return (
    <div className="max-w-7xl mx-auto">
      <DesktopNav />
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Focus Timer</h2>
        <p className="text-gray-600">
          Sessions completed today: <span className="font-semibold">{sessionCount}</span>
        </p>
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-6">
        <TimerDisplay
          minutes={minutes}
          seconds={seconds}
          mode={mode}
          isRunning={isRunning}
          duration={Math.floor(duration / 60)}
          remaining={remaining}
          totalDuration={duration}
          onAdjustMinutes={handleAdjustMinutes}
          onAdjustSeconds={handleAdjustSeconds}
        />

        <div className="mt-8">
          <TimerControls
            isRunning={isRunning}
            mode={mode}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </div>
      </div>

      {/* Preset Durations */}
      {!isRunning && mode !== 'break' && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Quick Start
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {PRESET_DURATIONS.map((preset) => (
              <Button
                key={preset.minutes}
                onClick={() => handlePresetSelect(preset.minutes)}
                variant="secondary"
                className="w-full"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Linked Task */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {linkedTask ? 'Focused On' : 'Link to Task (Optional)'}
        </h3>
        
        {linkedTask ? (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <span className="font-medium text-gray-900">{linkedTask.title}</span>
            <Button
              onClick={() => setLinkedTask(undefined)}
              variant="ghost"
              size="sm"
            >
              Unlink
            </Button>
          </div>
        ) : (
          <>
            {!showTaskSelector ? (
              <Button
                onClick={() => setShowTaskSelector(true)}
                variant="secondary"
                className="w-full"
                disabled={incompleteTasks.length === 0}
              >
                {incompleteTasks.length === 0
                  ? 'No tasks available'
                  : 'Select a task'}
              </Button>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {incompleteTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {task.title}
                  </button>
                ))}
                <Button
                  onClick={() => setShowTaskSelector(false)}
                  variant="ghost"
                  className="w-full mt-2"
                >
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Alarm Modal */}
      {showAlarm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in zoom-in-95 duration-300">
            <div className="text-center">
              {/* Alarm Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'focus' ? 'Focus Session Complete!' : 'Break Time Over!'}
              </h3>
              <p className="text-gray-600 mb-6">
                {mode === 'focus' 
                  ? 'Great job! Take a break or continue with another session.' 
                  : 'Time to get back to work!'}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => snooze(5)}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                >
                  ⏰ Snooze +5 Minutes
                </button>
                
                {mode === 'focus' && (
                  <button
                    onClick={() => {
                      dismissAlarm();
                      const breakDuration = 5 * 60;
                      setDuration(5);
                      start();
                    }}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                  >
                    ☕ Start Break (5 min)
                  </button>
                )}

                <button
                  onClick={dismissAlarm}
                  className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
