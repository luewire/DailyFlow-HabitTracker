'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Droplet, Flame, BicepsFlexed, PersonStanding, Flower2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitStore } from '@/store/habitStore';
import { useWaterStore } from '@/store/waterStore';
import { useWorkoutStore } from '@/store/workoutStore';
import { calculateStreak } from '@/lib/utils/streak';

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  streak: number;
  progress: number;
  progressLabel: string;
  progressValue: string;
}

export default function WorkoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { habits, fetchHabitData, getDailyProgress: getHabitProgress, getWeeklyTotal } = useHabitStore();
  const { weeklyWater, fetchWeeklyWater, getDailyProgress: getWaterProgress } = useWaterStore();
  const { weeklyWorkout, fetchWeeklyWorkout, getWeeklyProgress: getWorkoutProgress, getDailyProgress: getWorkoutDaily } = useWorkoutStore();

  useEffect(() => {
    if (user) {
      fetchHabitData(user.uid, 'meditation', 15);
      fetchHabitData(user.uid, 'running', 5); // 5km weekly goal
      fetchWeeklyWater(user.uid);
      fetchWeeklyWorkout(user.uid);
    }
  }, [user, fetchHabitData, fetchWeeklyWater, fetchWeeklyWorkout]);

  const displayHabits = useMemo(() => {
    const waterProgress = getWaterProgress();
    const meditationProgress = getHabitProgress('meditation');
    const runningTotal = getWeeklyTotal('running');
    const workoutProgress = getWorkoutProgress();

    // Calculate streaks
    const waterStreak = weeklyWater ? calculateStreak(weeklyWater.days) : 0;
    const meditationStreak = habits['meditation'] ? calculateStreak(habits['meditation'].days) : 0;
    const runningStreak = habits['running'] ? calculateStreak(habits['running'].days) : 0;

    const workoutDaily = getWorkoutDaily();
    const workoutStreak = calculateStreak(workoutDaily.map(d => ({
      day: d.day,
      total: d.completed,
      goal: 1 // If they did at least 1 exercise
    })));

    // For Workout: days completed vs days with exercises
    const workoutDaysWithExercises = workoutDaily.filter(d => d.total > 0).length;
    const workoutDaysCompleted = workoutDaily.filter(d => d.percentage >= 100).length;

    return [
      {
        id: 'water',
        name: 'Drink Water',
        description: 'Daily Goal: 2.5 Liters',
        icon: <Droplet size={24} />,
        iconBg: 'rgba(74, 144, 217, 0.2)',
        streak: waterStreak,
        progress: waterProgress.percentage,
        progressLabel: 'Progress',
        progressValue: `${waterProgress.percentage}%`,
      },
      {
        id: 'meditation',
        name: 'Meditation',
        description: 'Daily: 15 Minutes',
        icon: <Flower2 size={24} />,
        iconBg: 'rgba(232, 130, 94, 0.2)',
        streak: meditationStreak,
        progress: meditationProgress.percentage,
        progressLabel: 'Progress',
        progressValue: `${meditationProgress.percentage}%`,
      },
      {
        id: 'workout',
        name: 'Workout',
        description: '6 days a week',
        icon: <BicepsFlexed size={24} />,
        iconBg: 'rgba(156, 106, 222, 0.2)',
        streak: workoutStreak,
        progress: workoutProgress.percentage,
        progressLabel: 'Weekly Goal',
        progressValue: `${workoutDaysCompleted} of 4`, // design shows "3 of 4"
      },
      {
        id: 'running',
        name: 'Running',
        description: 'Weekly Goal: 5 km',
        icon: <PersonStanding size={24} />,
        iconBg: 'rgba(0, 230, 118, 0.2)',
        streak: runningStreak,
        progress: Math.min(100, Math.round((runningTotal / 5) * 100)),
        progressLabel: 'Progress',
        progressValue: `${runningTotal} of 5 km`,
      },
    ];
  }, [habits, weeklyWater, weeklyWorkout, getWaterProgress, getHabitProgress, getWorkoutProgress, getWorkoutDaily, getWeeklyTotal]);

  const activeCount = displayHabits.filter(h => h.streak > 0).length;

  const handleHabitClick = (habitId: string) => {
    if (habitId === 'workout') {
      router.push('/dashboard/workout/detail');
    } else if (habitId === 'water') {
      router.push('/dashboard/workout/water');
    } else if (habitId === 'meditation') {
      router.push('/dashboard/workout/meditation');
    } else if (habitId === 'running') {
      router.push('/dashboard/workout/running');
    }
  };

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Your Habits
          </h1>
        </div>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
          Focusing on {activeCount} active routines
        </p>
      </div>

      {/* Habits List */}
      <div className="space-y-3 sm:space-y-4">
        {displayHabits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => handleHabitClick(habit.id)}
            className="w-full text-left rounded-2xl p-4 sm:p-5 border transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {/* Top Section: Icon, Name, Streak */}
            <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Icon */}
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: habit.iconBg,
                  color: 'var(--text-primary)',
                }}
              >
                {/* Scale icon based on container */}
                {typeof habit.icon === 'object' && 'type' in habit.icon ? (
                  habit.icon
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                    {habit.icon}
                  </div>
                )}
              </div>

              {/* Name and Description */}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-base sm:text-lg font-bold mb-0.5 sm:mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {habit.name}
                </h3>
                <p className="text-[11px] sm:text-sm truncate" style={{ color: 'var(--text-muted)' }}>
                  {habit.description}
                </p>
              </div>

              {/* Streak */}
              <div className="flex flex-col items-end flex-shrink-0">
                <div className="flex items-center gap-1 mb-0.5 sm:mb-1">
                  <Flame size={14} className="sm:w-4 sm:h-4" style={{ color: 'var(--accent-green)' }} />
                  <span className="text-lg sm:text-2xl font-bold lh-none" style={{ color: 'var(--accent-green)' }}>
                    {habit.streak}
                  </span>
                </div>
                <p className="text-[8px] sm:text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                  STREAK
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                  {habit.progressLabel}
                </span>
                <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
                  {habit.progressValue}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                className="h-1.5 sm:h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(90, 125, 94, 0.2)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${habit.progress}%`,
                    background: 'var(--accent-green)',
                  }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
