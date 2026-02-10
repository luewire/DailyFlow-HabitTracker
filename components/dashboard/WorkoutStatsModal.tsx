'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutStore } from '@/store/workoutStore';
import { Modal } from '@/components/ui/Modal';
import { CircularProgress } from './CircularProgress';
import { DailyActivityChart } from './DailyActivityChart';
import { BicepsFlexed, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

interface WorkoutStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkoutStatsModal({ isOpen, onClose }: WorkoutStatsModalProps) {
  const { user } = useAuth();
  const { monthlyWorkouts, fetchMonthlyWorkouts, getMonthlyProgress, getWeeklyProgress, getDailyProgress } = useWorkoutStore();

  useEffect(() => {
    if (isOpen && user) {
      fetchMonthlyWorkouts(user.uid);
    }
  }, [isOpen, user, fetchMonthlyWorkouts]);

  const monthlyProgress = getMonthlyProgress();
  const weeklyProgress = getWeeklyProgress();
  const dailyProgress = getDailyProgress();

  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workout Statistics">
      <div className="space-y-6">
        {/* Monthly Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">{currentMonth} Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{monthlyProgress.completed}</div>
              <div className="text-sm text-gray-600">Exercises Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{monthlyProgress.total}</div>
              <div className="text-sm text-gray-600">Total Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{monthlyProgress.percentage}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
          </div>

          <div className="flex justify-center">
            <CircularProgress percentage={monthlyProgress.percentage} size={120} />
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Daily Workout Activity</h3>
          </div>
          <DailyActivityChart data={dailyProgress} />
        </div>

        {/* Weekly Breakdown */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
          </div>

          <div className="space-y-3">
            {monthlyProgress.weeks.map((week) => (
              <div key={week.weekId} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{week.weekId}</span>
                  <span className="text-sm text-gray-600">
                    {week.completed} / {week.total} ({week.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${week.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Week Highlight */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <BicepsFlexed className="text-green-600" size={20} />
            <h4 className="font-semibold text-gray-900">Current Week Progress</h4>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {weeklyProgress.completed} of {weeklyProgress.total} exercises completed
            </span>
            <span className="text-lg font-bold text-green-600">{weeklyProgress.percentage}%</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}