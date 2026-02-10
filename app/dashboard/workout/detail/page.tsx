'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Flame, Zap, Flame as Fire, Plus, BicepsFlexed, Activity, Timer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutStore, Exercise as StoreExercise } from '@/store/workoutStore';

interface Exercise {
    id: string;
    name: string;
    description: string;
    icon: any;
    iconBg: string;
    completed: boolean;
}

export default function WorkoutDetailPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        fetchWeeklyWorkout,
        weeklyWorkout,
        toggleExercise: toggleStoreExercise,
        getCurrentDayWorkout
    } = useWorkoutStore();

    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (user) {
            fetchWeeklyWorkout(user.uid);
        }
    }, [user, fetchWeeklyWorkout]);

    useEffect(() => {
        const dayWorkout = getCurrentDayWorkout();
        if (dayWorkout && weeklyWorkout) {
            const mappedExercises = dayWorkout.exercises.map((ex: StoreExercise) => {
                let icon = BicepsFlexed;
                let iconBg = 'rgba(74, 144, 217, 0.2)'; // Blueish default

                const lowerName = ex.name.toLowerCase();
                if (lowerName.includes('push up') || lowerName.includes('push-up')) {
                    icon = Activity;
                    iconBg = 'rgba(0, 230, 118, 0.2)'; // Green
                } else if (lowerName.includes('pull') || lowerName.includes('chin')) {
                    icon = BicepsFlexed;
                    iconBg = 'rgba(232, 130, 94, 0.2)'; // Orange
                } else if (lowerName.includes('sq') || lowerName.includes('leg') || lowerName.includes('lunge')) {
                    icon = Activity;
                    iconBg = 'rgba(156, 106, 222, 0.2)'; // Purple
                } else if (lowerName.includes('plank') || lowerName.includes('run') || lowerName.includes('cardio')) {
                    icon = Timer;
                    iconBg = 'rgba(245, 200, 66, 0.2)'; // Yellow
                }

                return {
                    id: ex.id,
                    name: ex.name,
                    description: `${ex.sets} sets • ${ex.reps}`,
                    icon: icon,
                    iconBg: iconBg,
                    completed: weeklyWorkout.completedExercises.includes(ex.id),
                };
            });
            setExercises(mappedExercises);
        }
    }, [weeklyWorkout, getCurrentDayWorkout]);

    const toggleExercise = async (id: string) => {
        // Optimistic update
        setExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, completed: !ex.completed } : ex
        ));

        await toggleStoreExercise(id);
    };

    const completedCount = exercises.filter(ex => ex.completed).length;
    const totalCount = exercises.length;
    const isAllCompleted = totalCount > 0 && completedCount === totalCount;

    // Calculate stats based on exercises (mock logic for now as store doesn't have intensity/calories yet)
    // We could make this dynamic based on the day later
    const currentDay = getCurrentDayWorkout()?.day || 'Monday';

    const dayTitles: Record<string, string> = {
        'Monday': 'PULL (BACK & BICEPS)',
        'Tuesday': 'PUSH (CHEST, SHOULDER, TRICEPS)',
        'Wednesday': 'LEGS',
        'Thursday': 'CORE',
        'Friday': 'UPPER MIX',
        'Saturday': 'CONDITIONING + ABS',
        'Sunday': 'REST / STRETCHING'
    };

    const dayTitle = dayTitles[currentDay] || currentDay.toUpperCase();

    return (
        <div className="min-h-screen pb-28" style={{ background: 'var(--bg-primary)' }}>
            {/* Header */}
            <div className="px-5 pt-12 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full transition-colors"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{
                            background: isAllCompleted ? 'rgba(0, 230, 118, 0.2)' : 'transparent',
                        }}
                    >
                        <Flame size={16} style={{ color: 'var(--accent-green)' }} />
                        <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
                            {isAllCompleted ? 'Streak Kept!' : 'Keep Streak'}
                        </span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded text-[var(--accent-green)] bg-[rgba(0,230,118,0.1)]">
                            {currentDay.toUpperCase()}
                        </span>
                    </div>

                    <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                        {dayTitle}
                    </h1>
                    <p
                        className="text-xs tracking-wider uppercase mt-1"
                        style={{ color: isAllCompleted ? 'var(--accent-green)' : 'var(--text-muted)' }}
                    >
                        {isAllCompleted ? 'SESSION COMPLETED' : 'SESSION ACTIVE'}
                    </p>
                </div>
            </div>

            <div className="px-5 space-y-4">
                {/* Goal Reached Card - Only show when completed */}
                {isAllCompleted && (
                    <div
                        className="rounded-2xl p-5 border flex items-center gap-4"
                        style={{
                            background: 'rgba(0, 230, 118, 0.1)',
                            borderColor: 'var(--accent-green)',
                        }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--accent-green)' }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="var(--bg-primary)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--accent-green)' }}>
                                Goal Reached!
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--accent-green)', opacity: 0.9 }}>
                                You've completed everything for today.
                            </p>
                        </div>
                    </div>
                )}

                {/* Stats Cards - Dynamic based on exercise count roughly */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Intensity Card */}
                    <div
                        className="rounded-2xl p-4 border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                                EXERCISES
                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {totalCount}
                            </span>
                            <span className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>
                                Movements
                            </span>
                        </div>
                    </div>

                    {/* Calories Card */}
                    <div
                        className="rounded-2xl p-4 border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Fire size={14} style={{ color: 'var(--text-muted)' }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                                SETS
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {exercises.length * 3}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                est. total
                            </span>
                        </div>
                    </div>
                </div>

                {/* Today's Routine Card */}
                <div
                    className="rounded-2xl p-5 border"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                    }}
                >
                    <h3 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: 'var(--text-muted)' }}>
                        TODAY'S ROUTINE
                    </h3>

                    <div className="space-y-3">
                        {exercises.length > 0 ? (
                            exercises.map((exercise) => (
                                <button
                                    key={exercise.id}
                                    onClick={() => toggleExercise(exercise.id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                                    style={{
                                        background: 'var(--bg-elevated)',
                                    }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: exercise.iconBg }}
                                    >
                                        <exercise.icon size={18} style={{ color: 'var(--text-primary)' }} />
                                    </div>

                                    <div className="flex-1 text-left">
                                        <p className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                            {exercise.name}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {exercise.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${exercise.completed ? '' : 'border-2'
                                            }`}
                                        style={{
                                            background: exercise.completed ? 'var(--accent-green)' : 'transparent',
                                            borderColor: exercise.completed ? 'var(--accent-green)' : 'var(--border-subtle)',
                                        }}
                                    >
                                        {exercise.completed && (
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path
                                                    d="M11.6666 3.5L5.24998 9.91667L2.33331 7"
                                                    stroke="var(--bg-primary)"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                Loading workout...
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
