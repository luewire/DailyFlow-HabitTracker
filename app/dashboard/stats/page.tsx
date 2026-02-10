'use client';

import { useEffect, useMemo, useState } from 'react';
import { Droplet, TrendingUp, Flower2, BicepsFlexed, PersonStanding } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitStore } from '@/store/habitStore';
import { useWaterStore } from '@/store/waterStore';
import { useWorkoutStore } from '@/store/workoutStore';

export default function StatsPage() {
    const { user } = useAuth();
    const { habits, previousHabits, fetchHabitData, fetchPreviousHabitData, getDailyProgress: getHabitProgress, getWeeklyProgress: getHabitWeekly, getWeeklyTotal } = useHabitStore();
    const { weeklyWater, previousWeeklyWater, fetchWeeklyWater, fetchPreviousWeeklyWater, getDailyProgress: getWaterProgress, getWeeklyProgress: getWaterWeekly } = useWaterStore();
    const { weeklyWorkout, previousWeeklyWorkout, fetchWeeklyWorkout, fetchPreviousWeeklyWorkout, getWeeklyProgress: getWorkoutProgress, getDailyProgress: getWorkoutDaily } = useWorkoutStore();

    useEffect(() => {
        if (user) {
            fetchHabitData(user.uid, 'meditation', 15);
            fetchPreviousHabitData(user.uid, 'meditation');
            fetchHabitData(user.uid, 'running', 5);
            fetchPreviousHabitData(user.uid, 'running');
            fetchWeeklyWater(user.uid);
            fetchPreviousWeeklyWater(user.uid);
            fetchWeeklyWorkout(user.uid);
            fetchPreviousWeeklyWorkout(user.uid);
        }
    }, [user, fetchHabitData, fetchPreviousHabitData, fetchWeeklyWater, fetchPreviousWeeklyWater, fetchWeeklyWorkout, fetchPreviousWeeklyWorkout]);

    // Habit breakdown data from stores
    const displayHabits = useMemo(() => {
        const waterProgress = getWaterProgress();
        const meditationProgress = getHabitProgress('meditation');
        const runningTotal = getWeeklyTotal('running');
        const workoutProgress = getWorkoutProgress();

        return [
            { id: 'water', name: 'Water Intake', icon: Droplet, progress: waterProgress.percentage, color: '#00E676', iconBg: 'rgba(0, 230, 118, 0.2)' },
            { id: 'meditation', name: 'Meditation', icon: Flower2, progress: meditationProgress.percentage, color: '#E8825E', iconBg: 'rgba(232, 130, 94, 0.2)' },
            { id: 'workout', name: 'Daily Workout', icon: BicepsFlexed, progress: workoutProgress.percentage, color: '#4A90D9', iconBg: 'rgba(74, 144, 217, 0.2)' },
            { id: 'running', name: 'Running Focus', icon: PersonStanding, progress: Math.min(100, Math.round((runningTotal / 5) * 100)), color: '#00E676', iconBg: 'rgba(0, 230, 118, 0.2)' },
        ];
    }, [habits, weeklyWater, weeklyWorkout, getWaterProgress, getHabitProgress, getWorkoutProgress]);

    // Aggregate real weekly performance data
    const todayIndex = new Date().getDay(); // 0 is Sunday
    const normalizedToday = todayIndex === 0 ? 6 : todayIndex - 1;

    const weeklyData = useMemo(() => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return days.map((dayName, index) => {
            if (index > normalizedToday) return 0; // Future days are 0

            const waterOk = (weeklyWater?.days.find(d => d.day === dayName)?.total ?? 0) >= 2500;
            const meditationOk = (habits['meditation']?.days.find(d => d.day === dayName)?.total ?? 0) >= 15;
            const runningOk = (habits['running']?.days.find(d => d.day === dayName)?.total ?? 0) >= 1;
            // Fix: Use 'workouts' instead of 'days' for weeklyWorkout
            const workoutOk = (weeklyWorkout?.workouts.find(d => d.day === dayName)?.exercises.some(e => weeklyWorkout.completedExercises.includes(e.id)) ?? false);

            const totalActive = 4;
            const completedCount = (waterOk ? 1 : 0) + (meditationOk ? 1 : 0) + (runningOk ? 1 : 0) + (workoutOk ? 1 : 0);

            return Math.round((completedCount / totalActive) * 100);
        });
    }, [habits, weeklyWater, weeklyWorkout, normalizedToday]);

    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    // Aggregate previous weekly performance data
    const previousWeeklyData = useMemo(() => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        return days.map((dayName) => {
            const waterOk = (previousWeeklyWater?.days.find(d => d.day === dayName)?.total ?? 0) >= 2500;
            const meditationOk = (previousHabits['meditation']?.days.find(d => d.day === dayName)?.total ?? 0) >= 15;
            const runningOk = (previousHabits['running']?.days.find(d => d.day === dayName)?.total ?? 0) >= 1;
            // Fix: Use 'workouts' instead of 'days' for weeklyWorkout
            const workoutOk = (previousWeeklyWorkout?.workouts.find(d => d.day === dayName)?.exercises.some(e => previousWeeklyWorkout.completedExercises.includes(e.id)) ?? false);

            const totalActive = 4;
            const completedCount = (waterOk ? 1 : 0) + (meditationOk ? 1 : 0) + (runningOk ? 1 : 0) + (workoutOk ? 1 : 0);

            return Math.round((completedCount / totalActive) * 100);
        });
    }, [previousHabits, previousWeeklyWater, previousWeeklyWorkout]);

    const weeklyAvg = useMemo(() => {
        const currentWeekDays = weeklyData.slice(0, normalizedToday + 1);

        if (currentWeekDays.length === 0) return 0;

        const sum = currentWeekDays.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / currentWeekDays.length);
    }, [weeklyData]);

    const maxValue = 100;

    // Generate monthly progress grid (current month)
    const getMonthlyGrid = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startingDayOfWeek = firstDay.getDay();

        const grid = [];

        // Add empty slots for alignment (Monday-based alignment for UI consistency)
        // JS getDay(): 0-Sunday, 1-Monday...
        // We want 1-Monday to be index 0
        const mondayBasedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

        for (let i = 0; i < mondayBasedStartingDay; i++) {
            grid.push({ empty: true });
        }

        // For now, we only have data for the current week in the stores.
        // We'll mark the rest as completed/not based on mock + current week data.
        const currentWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const currentDayIndex = new Date().getDay(); // 0 is Sunday
        const normalizedCurrentDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isFuture = date > today;

            // Check if this day is in the current week
            const todayDate = today.getDate();
            const diff = day - todayDate;
            const absoluteDayOfWeek = normalizedCurrentDayIndex + diff;

            let isCompleted = false;
            let isPerfect = false;

            if (!isFuture && absoluteDayOfWeek >= 0 && absoluteDayOfWeek < 7) {
                const dayName = currentWeekDays[absoluteDayOfWeek];
                const waterOk = (weeklyWater?.days.find(d => d.day === dayName)?.total ?? 0) >= 2500;
                const meditationOk = (habits['meditation']?.days.find(d => d.day === dayName)?.total ?? 0) >= 15;
                const runningOk = (habits['running']?.days.find(d => d.day === dayName)?.total ?? 0) >= 1; // At least some running

                isPerfect = waterOk && meditationOk && runningOk;
                isCompleted = waterOk || meditationOk || runningOk;
            } else if (!isFuture) {
                // Mock for past weeks
                isPerfect = day % 2 === 0;
                isCompleted = day % 3 === 0 || isPerfect;
            }

            grid.push({
                day,
                isPerfect,
                isCompleted,
                isFuture,
            });
        }

        return grid;
    };

    const monthlyGrid = getMonthlyGrid();
    const perfectDays = monthlyGrid.filter(d => d.isPerfect && !d.empty).length;

    // Calculate current streak from grid
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (const item of monthlyGrid) {
        if (item.empty || item.isFuture) continue;
        if (item.isCompleted) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
            if (item.day === new Date().getDate()) {
                currentStreak = tempStreak;
            }
        } else {
            tempStreak = 0;
        }
    }

    return (
        <div className="min-h-screen pb-28" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="px-5 pt-6 sm:pt-12 pb-4 sm:pb-6">
                <p className="text-[10px] sm:text-xs font-bold tracking-widest mb-1" style={{ color: 'var(--accent-green)' }}>
                    ANALYTICS
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Statistics
                </h1>
            </div>

            <div className="px-5 space-y-4">
                {/* Weekly Performance Card - Premium Redesign */}
                <div
                    className="rounded-2xl p-4 sm:p-5 border overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(20, 35, 25, 0.95), rgba(12, 22, 15, 0.98))',
                        borderColor: 'rgba(0, 230, 118, 0.08)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                            Weekly Performance
                        </h3>
                        <div
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold"
                            style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--accent-green)' }}
                        >
                            <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                            {weeklyAvg}%
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--accent-green)' }} />
                            <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>This Week</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(120, 120, 120, 0.5)' }} />
                            <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>Last Week</span>
                        </div>
                    </div>

                    {/* Chart Area */}
                    <div className="relative h-44 sm:h-52">
                        <svg className="w-full h-full" viewBox="0 0 350 180" preserveAspectRatio="xMidYMid meet">
                            <defs>
                                {/* Current week area gradient */}
                                <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00E676" stopOpacity="0.25" />
                                    <stop offset="60%" stopColor="#00E676" stopOpacity="0.06" />
                                    <stop offset="100%" stopColor="#00E676" stopOpacity="0" />
                                </linearGradient>
                                {/* Previous week area gradient */}
                                <linearGradient id="prevLineArea" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#888888" stopOpacity="0.08" />
                                    <stop offset="100%" stopColor="#888888" stopOpacity="0" />
                                </linearGradient>
                                {/* Glow filter for current day point */}
                                <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                {/* Line glow */}
                                <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                                    <feGaussianBlur stdDeviation="2" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Horizontal Grid Lines */}
                            {[0, 25, 50, 75, 100].map((pct) => {
                                const y = 160 - (pct / 100) * 140;
                                return (
                                    <g key={pct}>
                                        <line x1="0" y1={y} x2="350" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                                        {pct > 0 && (
                                            <text x="348" y={y - 4} fill="rgba(255,255,255,0.15)" fontSize="8" textAnchor="end">
                                                {pct}%
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Previous Week - Area Fill */}
                            <path
                                d={`
                                    M ${25} 160
                                    L ${25} ${160 - (previousWeeklyData[0] / 100) * 140}
                                    ${previousWeeklyData.slice(1).map((value, index) => {
                                    const i = index + 1;
                                    const prevX = 25 + ((i - 1) / 6) * 300;
                                    const prevY = 160 - (previousWeeklyData[i - 1] / 100) * 140;
                                    const x = 25 + (i / 6) * 300;
                                    const y = 160 - (value / 100) * 140;
                                    const cpx = prevX + (x - prevX) / 2;
                                    return `C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
                                }).join(' ')}
                                    L ${325} 160 Z
                                `}
                                fill="url(#prevLineArea)"
                            />

                            {/* Previous Week - Curve */}
                            <path
                                d={`M ${25} ${160 - (previousWeeklyData[0] / 100) * 140}
                                    ${previousWeeklyData.slice(1).map((value, index) => {
                                    const i = index + 1;
                                    const prevX = 25 + ((i - 1) / 6) * 300;
                                    const prevY = 160 - (previousWeeklyData[i - 1] / 100) * 140;
                                    const x = 25 + (i / 6) * 300;
                                    const y = 160 - (value / 100) * 140;
                                    const cpx = prevX + (x - prevX) / 2;
                                    return `C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke="rgba(150, 150, 150, 0.35)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Previous Week - Data Points */}
                            {previousWeeklyData.map((value, index) => (
                                <circle
                                    key={`prev-${index}`}
                                    cx={25 + (index / 6) * 300}
                                    cy={160 - (value / 100) * 140}
                                    r="2.5"
                                    fill="rgba(150, 150, 150, 0.3)"
                                />
                            ))}

                            {/* Current Week - Area Fill */}
                            <path
                                d={`
                                    M ${25} 160
                                    L ${25} ${160 - (weeklyData[0] / 100) * 140}
                                    ${weeklyData.slice(1).map((value, index) => {
                                    const i = index + 1;
                                    const prevX = 25 + ((i - 1) / 6) * 300;
                                    const prevY = 160 - (weeklyData[i - 1] / 100) * 140;
                                    const x = 25 + (i / 6) * 300;
                                    const y = 160 - (value / 100) * 140;
                                    const cpx = prevX + (x - prevX) / 2;
                                    return `C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
                                }).join(' ')}
                                    L ${325} 160 Z
                                `}
                                fill="url(#lineAreaGradient)"
                            />

                            {/* Current Week - Curve (with glow) */}
                            <path
                                d={`M ${25} ${160 - (weeklyData[0] / 100) * 140}
                                    ${weeklyData.slice(1).map((value, index) => {
                                    const i = index + 1;
                                    const prevX = 25 + ((i - 1) / 6) * 300;
                                    const prevY = 160 - (weeklyData[i - 1] / 100) * 140;
                                    const x = 25 + (i / 6) * 300;
                                    const y = 160 - (value / 100) * 140;
                                    const cpx = prevX + (x - prevX) / 2;
                                    return `C ${cpx} ${prevY}, ${cpx} ${y}, ${x} ${y}`;
                                }).join(' ')}`}
                                fill="none"
                                stroke="#00E676"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter="url(#lineGlow)"
                            />

                            {/* Invisible hit areas for hover/touch tooltip */}
                            {weeklyData.map((value, index) => {
                                const cx = 25 + (index / 6) * 300;
                                const cy = 160 - (value / 100) * 140;
                                const isFuture = index > normalizedToday;
                                const isHovered = hoveredPoint === index;

                                if (isFuture) return null;

                                return (
                                    <g key={`hit-${index}`}>
                                        {/* Invisible hit area */}
                                        <rect
                                            x={cx - 20}
                                            y={0}
                                            width={40}
                                            height={180}
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredPoint(index)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                            onTouchStart={() => setHoveredPoint(index)}
                                            onTouchEnd={() => setTimeout(() => setHoveredPoint(null), 1500)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        {/* Tooltip + dot on hover */}
                                        {isHovered && (
                                            <>
                                                {/* Vertical guide line */}
                                                <line
                                                    x1={cx} y1={cy} x2={cx} y2={160}
                                                    stroke="rgba(0, 230, 118, 0.15)"
                                                    strokeWidth="1"
                                                    strokeDasharray="3 2"
                                                />
                                                {/* Dot */}
                                                <circle cx={cx} cy={cy} r="5" fill="#00E676" filter="url(#pointGlow)" />
                                                {/* Tooltip background */}
                                                <rect
                                                    x={cx - 22}
                                                    y={cy - 28}
                                                    width={44}
                                                    height={20}
                                                    rx={6}
                                                    fill="rgba(0, 230, 118, 0.15)"
                                                    stroke="rgba(0, 230, 118, 0.3)"
                                                    strokeWidth="0.5"
                                                />
                                                {/* Tooltip text */}
                                                <text
                                                    x={cx}
                                                    y={cy - 14}
                                                    fill="#69F0AE"
                                                    fontSize="10"
                                                    fontWeight="700"
                                                    textAnchor="middle"
                                                >
                                                    {value}%
                                                </text>
                                            </>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Day Labels */}
                        <div className="flex justify-between px-0 mt-1">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                const isCurrent = index === normalizedToday;
                                return (
                                    <span
                                        key={day}
                                        className="text-[9px] sm:text-[10px] font-medium text-center"
                                        style={{
                                            color: isCurrent ? 'var(--accent-green)' : 'var(--text-muted)',
                                            width: `${100 / 7}%`,
                                        }}
                                    >
                                        {day}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Stats Row */}
                    <div
                        className="flex items-center justify-between mt-4 pt-4 border-t"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Best Day</p>
                            <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--accent-green)' }}>
                                {(() => {
                                    const best = Math.max(...weeklyData);
                                    const bestIdx = weeklyData.indexOf(best);
                                    return best > 0 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][bestIdx] : '—';
                                })()}
                            </p>
                        </div>
                        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Weekly Avg</p>
                            <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>{weeklyAvg}%</p>
                        </div>
                        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>vs Last Week</p>
                            <p className="text-sm sm:text-base font-bold" style={{
                                color: (() => {
                                    const prevAvg = previousWeeklyData.reduce((a, b) => a + b, 0) / 7;
                                    return weeklyAvg >= prevAvg ? '#00E676' : '#FF5252';
                                })()
                            }}>
                                {(() => {
                                    const prevAvg = Math.round(previousWeeklyData.reduce((a, b) => a + b, 0) / 7);
                                    const diff = weeklyAvg - prevAvg;
                                    return diff >= 0 ? `+${diff}%` : `${diff}%`;
                                })()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Monthly Progress Card - Premium Redesign */}
                <div
                    className="rounded-2xl p-4 sm:p-5 border overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(20, 35, 25, 0.95), rgba(12, 22, 15, 0.98))',
                        borderColor: 'rgba(0, 230, 118, 0.08)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                            Monthly Progress
                        </h3>
                        <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(0, 230, 118, 0.1)', color: 'var(--accent-green)' }}>
                            {new Date().toLocaleString('en-US', { month: 'long' })}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                        Activity heatmap — brighter = more habits completed
                    </p>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-1.5">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                            <div
                                key={idx}
                                className="text-center text-[8px] sm:text-[9px] font-bold tracking-wider"
                                style={{ color: 'rgba(255,255,255,0.2)' }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Activity Grid */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-5">
                        {monthlyGrid.map((item, idx) => {
                            if (item.empty) {
                                return <div key={`empty-${idx}`} className="aspect-square" />;
                            }

                            const isToday = item.day === new Date().getDate() && !item.isFuture;

                            return (
                                <div
                                    key={idx}
                                    className="aspect-square rounded-md sm:rounded-lg transition-all relative group"
                                    style={{
                                        background: item.isFuture
                                            ? 'rgba(255, 255, 255, 0.02)'
                                            : item.isPerfect
                                                ? '#00E676'
                                                : item.isCompleted
                                                    ? 'rgba(0, 230, 118, 0.35)'
                                                    : 'rgba(255, 255, 255, 0.04)',
                                        border: isToday
                                            ? '1.5px solid rgba(0, 230, 118, 0.6)'
                                            : item.isFuture
                                                ? '1px dashed rgba(255,255,255,0.04)'
                                                : '1px solid transparent',
                                        boxShadow: item.isPerfect
                                            ? '0 0 8px rgba(0, 230, 118, 0.3)'
                                            : 'none',
                                    }}
                                >
                                    {/* Day number */}
                                    <span
                                        className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-medium"
                                        style={{
                                            color: item.isPerfect
                                                ? 'rgba(0, 30, 10, 0.8)'
                                                : item.isCompleted
                                                    ? 'rgba(0, 230, 118, 0.7)'
                                                    : item.isFuture
                                                        ? 'rgba(255,255,255,0.08)'
                                                        : 'rgba(255,255,255,0.2)',
                                        }}
                                    >
                                        {item.day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Row */}
                    <div
                        className="flex items-center justify-between pt-4 border-t"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                Perfect Days
                            </p>
                            <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--accent-green)' }}>
                                {perfectDays}
                            </p>
                        </div>
                        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                Current Streak
                            </p>
                            <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {currentStreak}d
                            </p>
                        </div>
                        <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.06)' }} />
                        <div className="text-center flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                Longest Streak
                            </p>
                            <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {longestStreak}d
                            </p>
                        </div>
                    </div>
                </div>

                {/* Habit Breakdown Card */}
                <div
                    className="rounded-2xl p-4 sm:p-5 border overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(20, 35, 25, 0.95), rgba(12, 22, 15, 0.98))',
                        borderColor: 'rgba(0, 230, 118, 0.08)',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                            Habit Breakdown
                        </h3>
                        <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                            Today
                        </span>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        {displayHabits.map((habit) => (
                            <div key={habit.id}>
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <div
                                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: habit.iconBg }}
                                    >
                                        <habit.icon size={18} className="sm:w-5 sm:h-5" style={{ color: habit.color }} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs sm:text-sm font-semibold truncate mr-2" style={{ color: 'var(--text-primary)' }}>
                                                {habit.name}
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold" style={{ color: habit.color }}>
                                                {habit.progress}%
                                            </span>
                                        </div>
                                        <div
                                            className="h-1.5 sm:h-2 rounded-full overflow-hidden"
                                            style={{ background: 'rgba(90, 125, 94, 0.2)' }}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${habit.progress}%`,
                                                    background: habit.color,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
