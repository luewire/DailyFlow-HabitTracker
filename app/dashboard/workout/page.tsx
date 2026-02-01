'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutStore } from '@/store/workoutStore';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { WorkoutSkeleton, CardSkeleton } from '@/components/ui/SkeletonLoader';
import { Trophy, CheckCircle2, Circle } from 'lucide-react';

export default function WorkoutPage() {
  const { user } = useAuth();
  const { 
    weeklyWorkout,
    loading, 
    fetchWeeklyWorkout,
    toggleExercise,
    getWeeklyProgress,
    getCurrentDayWorkout,
  } = useWorkoutStore();

  useEffect(() => {
    if (user) {
      fetchWeeklyWorkout(user.uid);
    }
  }, [user, fetchWeeklyWorkout]);

  const progress = getWeeklyProgress();
  const currentDayWorkout = getCurrentDayWorkout();

  if (loading || !weeklyWorkout) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <CardSkeleton />
        <div className="space-y-3 mt-6">
          <WorkoutSkeleton />
          <WorkoutSkeleton />
          <WorkoutSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DesktopNav />
      
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Weekly Workout</h2>
        <p className="text-gray-600 mt-1">
          {currentDayWorkout?.day}'s Exercises
        </p>
      </div>

      {/* Weekly Progress Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {progress.completed} / {progress.total} exercises
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
            style={{ width: `${progress.percentage}%` }}
          >
            {progress.percentage > 10 && (
              <span className="text-xs font-bold text-white">
                {progress.percentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Week {weeklyWorkout.weekId} • Resets every Monday
        </p>
        {progress.percentage === 100 && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 flex items-center gap-3">
            <Trophy className="text-green-600" size={24} />
            <p className="text-green-800 font-medium">
              Incredible! You completed all weekly workouts! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Today's Workout */}
      {currentDayWorkout ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-blue-500" />
            {currentDayWorkout.day}'s Workout
          </h3>
          <div className="space-y-3">
            {currentDayWorkout.exercises.map((exercise) => {
              const isCompleted = weeklyWorkout.completedExercises.includes(exercise.id);
              return (
                <div
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                  ) : (
                    <Circle className="text-gray-400 flex-shrink-0" size={24} />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {exercise.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {exercise.sets} sets × {exercise.reps}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-600">No workout scheduled for today</p>
        </div>
      )}
    </div>
  );
}
