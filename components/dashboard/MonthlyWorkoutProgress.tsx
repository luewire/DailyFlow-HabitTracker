'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutStore } from '@/store/workoutStore';
import { DailyActivityChart } from './DailyActivityChart';
import { Dumbbell } from 'lucide-react';

export function MonthlyWorkoutProgress() {
  const { user } = useAuth();
  const router = useRouter();
  const { weeklyWorkout, fetchWeeklyWorkout, getWeeklyProgress, getDailyProgress, error } = useWorkoutStore();

  useEffect(() => {
    console.log('MonthlyWorkoutProgress: user state:', user?.uid);
    if (user) {
      fetchWeeklyWorkout(user.uid);
    }
  }, [user, fetchWeeklyWorkout]);

  useEffect(() => {
    console.log('MonthlyWorkoutProgress: weeklyWorkout state:', weeklyWorkout);
  }, [weeklyWorkout]);

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col items-center justify-center text-center">
        <p className="text-red-500 text-sm font-medium">Error loading progress</p>
        <p className="text-gray-500 text-xs mt-1">{error}</p>
        <button
          onClick={() => user && fetchWeeklyWorkout(user.uid)}
          className="mt-4 text-xs text-blue-500 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const progress = getWeeklyProgress();
  const dailyData = getDailyProgress();

  if (!weeklyWorkout) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex items-center justify-center h-48">
          <div className="w-full h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={() => router.push('/dashboard/stats')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Dumbbell className="text-blue-500 flex-shrink-0" size={16} />
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Weekly Workout Progress</h3>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <DailyActivityChart data={dailyData} />
      </div>

      <div className="mt-4">
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          {progress.completed} of {progress.total} exercises completed
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] sm:text-xs text-gray-400">
            Week {weeklyWorkout.weekId}
          </p>
          <p className="text-[10px] sm:text-xs text-blue-500 hover:text-blue-600 font-medium whitespace-nowrap">
            Click for monthly stats →
          </p>
        </div>
      </div>
    </div>
  );
}


