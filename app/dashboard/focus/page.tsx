'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitStore } from '@/store/habitStore';
import { useWaterStore } from '@/store/waterStore';
import { useWorkoutStore, type Exercise } from '@/store/workoutStore';
import { useTaskStore } from '@/store/taskStore';
import { calculateStreak } from '@/lib/utils/streak';
import {
  ChevronDown,
  ChevronUp,
  Flame,
  Play,
  Check,
  Flower2,
  BicepsFlexed,
  Droplet,
  Target,
  Clock,
  Activity,
  PersonStanding,
  List,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function FocusPage() {
  const { user } = useAuth();

  const { habits, fetchHabitData, addHabitLog, getDailyProgress: getHabitProgress, getWeeklyTotal } = useHabitStore();
  const { weeklyWater, fetchWeeklyWater, addWater, getDailyProgress: getWaterProgress } = useWaterStore();
  const { weeklyWorkout, fetchWeeklyWorkout, toggleExercise, getWeeklyProgress: getWorkoutProgress, getDailyProgress: getWorkoutDaily } = useWorkoutStore();
  const { tasks, fetchTasks, toggleComplete } = useTaskStore();

  const [initialMinutes, setInitialMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<{ id: string, name: string } | null>(null);
  const [selectedTask, setSelectedTask] = useState<{ id: string, title: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchHabitData(user.uid, 'meditation', 15);
      fetchHabitData(user.uid, 'running', 5);
      fetchWeeklyWater(user.uid);
      fetchWeeklyWorkout(user.uid);
      fetchTasks(user.uid);
    }
  }, [user, fetchHabitData, fetchWeeklyWater, fetchWeeklyWorkout, fetchTasks]);

  const displayHabits = useMemo(() => {
    const waterProgress = getWaterProgress();
    const meditationProgress = getHabitProgress('meditation');
    const runningTotal = getWeeklyTotal('running');
    const workoutProgress = getWorkoutProgress();

    // Calculate streaks
    const waterStreak = weeklyWater ? calculateStreak(weeklyWater.days) : 0;
    const meditationStreak = habits['meditation'] ? calculateStreak(habits['meditation'].days) : 0;
    const runningStreak = habits['running'] ? calculateStreak(habits['running'].days) : 0;

    const workoutDailyData = getWorkoutDaily();
    const workoutStreakValue = calculateStreak(workoutDailyData.map(d => ({
      day: d.day,
      total: d.completed,
      goal: 1
    })));

    return [
      {
        id: 'meditation',
        name: 'Meditation',
        icon: Flower2,
        iconBg: 'rgba(232, 130, 94, 0.2)',
        streak: meditationStreak,
        progress: meditationProgress.percentage,
        color: '#E8825E',
      },
      {
        id: 'workout',
        name: 'Workout',
        icon: BicepsFlexed,
        iconBg: 'rgba(74, 144, 217, 0.2)',
        streak: workoutStreakValue,
        progress: workoutProgress.percentage,
        color: '#4A90D9',
        exercises: workoutDailyData[(new Date().getDay() + 6) % 7]?.exercises || []
      },
      {
        id: 'running',
        name: 'Running',
        icon: PersonStanding,
        iconBg: 'rgba(0, 230, 118, 0.2)',
        streak: runningStreak,
        progress: Math.min(100, Math.round((runningTotal / 5) * 100)),
        color: '#00E676',
      },
      {
        id: 'water',
        name: 'Drink Water',
        icon: Droplet,
        iconBg: 'rgba(0, 230, 118, 0.2)',
        streak: waterStreak,
        progress: waterProgress.percentage,
        color: '#00E676',
      },
      {
        id: 'tasks',
        name: 'Daily Tasks',
        icon: List,
        iconBg: 'rgba(0, 230, 118, 0.2)',
        streak: 0,
        progress: tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0,
        color: '#00E676',
        items: tasks.filter(t => !t.completed)
      }
    ];
  }, [habits, weeklyWater, weeklyWorkout, tasks, getWaterProgress, getHabitProgress, getWorkoutProgress, getWorkoutDaily]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowCompletion(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const adjustMinutes = (delta: number) => {
    if (!isRunning) {
      const newMinutes = Math.max(1, Math.min(60, initialMinutes + delta));
      setInitialMinutes(newMinutes);
      setTimeLeft(newMinutes * 60);
    }
  };

  const toggleHabitExpand = (habitId: string) => {
    setExpandedHabit(expandedHabit === habitId ? null : habitId);
  };

  const selectHabit = (habitId: string, item?: { id: string, name?: string, title?: string }) => {
    setSelectedHabit(habitId);
    if (habitId === 'workout') {
      setSelectedExercise(item ? { id: item.id, name: item.name || '' } : null);
      setSelectedTask(null);
    } else if (habitId === 'tasks') {
      setSelectedTask(item ? { id: item.id, title: item.title || '' } : null);
      setSelectedExercise(null);
    } else {
      setSelectedExercise(null);
      setSelectedTask(null);
    }
  };

  const startTimer = () => {
    if (selectedHabit && !isRunning) {
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const handleDone = async () => {
    if (user && selectedHabit) {
      if (selectedHabit === 'meditation' || selectedHabit === 'running') {
        const isRunning = selectedHabit === 'running';
        const amount = isRunning ? 1.0 : initialMinutes;
        const unit = isRunning ? 'km' : 'min';
        const selectedName = isRunning ? 'Running' : 'Meditation';
        await addHabitLog(user.uid, selectedHabit, amount, unit, `${selectedName} Session`);
      } else if (selectedHabit === 'water') {
        await addWater(user.uid, 250); // Default 250ml cup
      } else if (selectedHabit === 'workout' && selectedExercise) {
        await toggleExercise(selectedExercise.id);
      } else if (selectedHabit === 'tasks' && selectedTask) {
        await toggleComplete(selectedTask.id);
      }
    }

    setShowCompletion(false);
    setInitialMinutes(25);
    setTimeLeft(25 * 60);
    setSelectedHabit(null);
    setSelectedExercise(null);
    setSelectedTask(null);
  };

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;

  if (showCompletion) {
    const selectedHabitData = displayHabits.find(h => h.id === selectedHabit);
    const completedName = selectedTask?.title || selectedExercise?.name || selectedHabitData?.name || 'Session';

    return (
      <div className="min-h-screen pb-28 px-5 animate-scale-up" style={{ background: 'var(--bg-primary)' }}>
        <div className="pt-12 pb-6">
          <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--accent-green)' }}>
            FOCUS
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Session
          </h1>
        </div>

        <div className="flex flex-col items-center pt-12">
          <div className="relative mb-8">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(0, 230, 118, 0.1)',
                border: '3px solid var(--accent-green)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 4L28 16H40L30 24L34 36L24 28L14 36L18 24L8 16H20L24 4Z"
                  fill="var(--accent-green)"
                />
              </svg>
            </div>
            <div
              className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-green)' }}
            >
              <Check size={20} style={{ color: 'var(--bg-primary)' }} strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-4xl font-bold mb-3 text-center" style={{ color: 'var(--text-primary)' }}>
            {completedName} Completed!
          </h2>
          <p className="text-center text-base mb-12 max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Incredible work! You've successfully finished your {selectedHabit === 'workout' || selectedHabit === 'tasks' ? 'session' : 'focus'} session.
          </p>

          <div
            className="w-full rounded-2xl p-6 mb-12 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0, 230, 118, 0.1)' }}
              >
                <Clock size={24} style={{ color: 'var(--accent-green)' }} />
              </div>
              <div className="flex-1">
                <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                  Time Focused
                </p>
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {initialMinutes}:00
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: selectedHabitData?.iconBg }}
              >
                {selectedHabitData && (
                  <selectedHabitData.icon size={24} style={{ color: selectedHabitData.color }} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                  {selectedHabit === 'tasks' ? 'Task' : 'Habit'}
                </p>
              </div>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {completedName}
              </span>
            </div>
          </div>

          <Button
            onClick={handleDone}
            className="w-full py-5 text-xl font-bold shadow-2xl rounded-2xl"
            style={{
              background: 'var(--accent-green)',
              color: 'var(--bg-primary)',
              boxShadow: '0 8px 32px rgba(0, 230, 118, 0.4)',
            }}
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 px-5" style={{ background: 'var(--bg-primary)' }}>
      <div className="pt-6 sm:pt-12 pb-4 sm:pb-6 text-center">
        <p className="text-[10px] sm:text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--accent-green)' }}>
          FOCUS
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Timer
        </h1>
      </div>

      <div className="flex items-center justify-center py-6 sm:py-12 mb-4 sm:mb-8 mt-2 sm:mt-4">
        <button
          onClick={() => adjustMinutes(-5)}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all active:scale-95 border border-white/5"
          style={{ background: 'var(--bg-card)', color: 'rgba(255,255,255,0.6)' }}
          disabled={isRunning}
        >
          <span className="text-xl sm:text-2xl">−</span>
        </button>

        <div className="mx-4 sm:mx-8 relative w-60 h-60 sm:w-72 sm:h-72">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 288 288">
            <circle
              cx="144"
              cy="144"
              r="130"
              fill="none"
              strokeWidth="4"
              style={{ stroke: 'rgba(255, 255, 255, 0.05)' }}
            />
            <circle
              cx="144"
              cy="144"
              r="130"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              style={{
                stroke: 'var(--accent-green)',
                strokeDasharray: `${2 * Math.PI * 130}`,
                strokeDashoffset: `${2 * Math.PI * 130 * (timeLeft / (initialMinutes * 60))}`,
                transition: isRunning ? 'none' : 'stroke-dashoffset 0.3s ease',
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-7xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {String(displayMinutes).padStart(2, '0')}:{String(displaySeconds).padStart(2, '0')}
            </span>
            <p className="text-[10px] sm:text-sm tracking-widest mt-2 sm:mt-4 opacity-40 font-bold" style={{ color: 'var(--text-primary)' }}>
              FOCUS TIME
            </p>
          </div>
        </div>

        <button
          onClick={() => adjustMinutes(5)}
          className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all active:scale-95 border border-white/5"
          style={{ background: 'var(--bg-card)', color: 'rgba(255,255,255,0.6)' }}
          disabled={isRunning}
        >
          <span className="text-xl sm:text-2xl">+</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-sm font-bold tracking-widest uppercase opacity-60" style={{ color: 'var(--text-primary)' }}>
            SELECT FOCUS
          </h3>
        </div>

        <div className="space-y-4">
          {displayHabits.map((habit) => (
            <div key={habit.id}>
              <button
                onClick={() => {
                  if ((habit.exercises && habit.exercises.length > 0) || (habit.items && habit.items.length > 0)) {
                    toggleHabitExpand(habit.id);
                  } else {
                    selectHabit(habit.id);
                  }
                }}
                className={`w-full rounded-3xl p-5 border transition-all ${selectedHabit === habit.id && !selectedExercise && !selectedTask ? 'ring-2' : ''
                  }`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: (selectedHabit === habit.id && !selectedExercise && !selectedTask) ? 'rgba(0, 230, 118, 0.3)' : 'var(--border-subtle)',
                  ...(selectedHabit === habit.id && !selectedExercise && !selectedTask
                    ? { '--tw-ring-color': 'var(--accent-green)' } as React.CSSProperties
                    : {}),
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: habit.iconBg }}
                  >
                    <habit.icon size={28} style={{ color: habit.color }} />
                  </div>

                  <div className="flex-1 text-left">
                    <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {habit.id !== 'tasks' ? (
                        <>
                          <Flame size={14} style={{ color: 'var(--accent-green)' }} />
                          <span className="text-xs font-bold opacity-60" style={{ color: 'var(--text-primary)' }}>
                            {habit.streak > 0 ? `${habit.streak} day streak` : 'No streak yet'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold opacity-60" style={{ color: 'var(--text-primary)' }}>
                          {habit.items?.length || 0} tasks remaining
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold" style={{ color: habit.color }}>{habit.progress}%</span>
                      <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${habit.progress}%`,
                            background: habit.color,
                          }}
                        />
                      </div>
                    </div>
                    {/* Arrow removed per user feedback for a cleaner look */}
                  </div>
                </div>
              </button>

              {expandedHabit === habit.id && (
                <div className="mt-2 ml-6 space-y-2 animate-expand animate-stagger">
                  {habit.exercises?.map((exercise: Exercise) => {
                    const isExerciseCompleted = weeklyWorkout?.completedExercises.includes(exercise.id);
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => {
                          selectHabit(habit.id, { id: exercise.id, name: exercise.name });
                        }}
                        className={`w-full rounded-2xl p-4 border transition-all flex items-center gap-4 ${selectedExercise?.id === exercise.id ? 'ring-2' : ''
                          }`}
                        style={{
                          background: selectedExercise?.id === exercise.id ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255,255,255,0.02)',
                          borderColor: isExerciseCompleted ? 'var(--accent-green)' : 'var(--border-subtle)',
                          ...(selectedExercise?.id === exercise.id
                            ? { '--tw-ring-color': 'var(--accent-green)' } as React.CSSProperties
                            : {}),
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          <BicepsFlexed size={20} className="opacity-60" style={{ color: habit.color }} />
                        </div>
                        <span className="flex-1 text-left text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                          {exercise.name}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isExerciseCompleted ? '' : 'border-2'
                            }`}
                          style={{
                            background: isExerciseCompleted ? 'var(--accent-green)' : 'transparent',
                            borderColor: 'rgba(255,255,255,0.1)',
                          }}
                        >
                          {isExerciseCompleted && (
                            <Check size={16} style={{ color: 'var(--bg-primary)' }} strokeWidth={4} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                  {habit.items?.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        selectHabit(habit.id, { id: task.id, title: task.title });
                      }}
                      className={`w-full rounded-2xl p-4 border transition-all flex items-center gap-4 ${selectedTask?.id === task.id ? 'ring-2' : ''
                        }`}
                      style={{
                        background: selectedTask?.id === task.id ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255,255,255,0.02)',
                        borderColor: 'var(--border-subtle)',
                        ...(selectedTask?.id === task.id
                          ? { '--tw-ring-color': 'var(--accent-green)' } as React.CSSProperties
                          : {}),
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        <List size={20} className="opacity-60" style={{ color: habit.color }} />
                      </div>
                      <span className="flex-1 text-left text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center border-2"
                        style={{
                          borderColor: 'rgba(255,255,255,0.1)',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {(selectedHabit) && (
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className="fixed bottom-24 right-8 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 z-40"
          style={{
            background: 'var(--accent-green)',
            boxShadow: '0 8px 32px rgba(0, 230, 118, 0.6)',
          }}
        >
          {isRunning ? (
            <div className="flex gap-1.5">
              <div className="w-2 h-8 rounded-full" style={{ background: 'var(--bg-primary)' }} />
              <div className="w-2 h-8 rounded-full" style={{ background: 'var(--bg-primary)' }} />
            </div>
          ) : (
            <Play size={36} style={{ color: 'var(--bg-primary)' }} fill="var(--bg-primary)" />
          )}
        </button>
      )}
    </div>
  );
}
