'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutStore } from '@/store/workoutStore';
import { CircularProgress } from './CircularProgress';
import { Dumbbell } from 'lucide-react';

export function MonthlyWorkoutProgress() {
  const { user } = useAuth();
  const { weeklyWorkout, fetchWeeklyWorkout, getWeeklyProgress } = useWorkoutStore();

  useEffect(() => {
    if (user) {
      fetchWeeklyWorkout(user.uid);
    }
  }, [user, fetchWeeklyWorkout]);

  const progress = getWeeklyProgress();

  if (!weeklyWorkout) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-full">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="flex items-center justify-center h-48">
          <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-6 h-full flex flex-col">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-6">
        <Dumbbell className="text-blue-500 flex-shrink-0" size={16} />
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Weekly Workout Progress</h3>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <CircularProgress percentage={progress.percentage} size={140} />
      </div>
      <div className="mt-2 sm:mt-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          {progress.completed} of {progress.total} exercises completed
        </p>
        <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
          Week {weeklyWorkout.weekId}
        </p>
      </div>
    </div>
  );
}
