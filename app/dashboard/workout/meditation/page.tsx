'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, Flame, Clock, Trash2, Zap, Flower2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitStore } from '@/store/habitStore';

const HABIT_ID = 'meditation';
const DEFAULT_GOAL = 15; // 15 minutes

export default function MeditationDetailPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        habits,
        fetchHabitData,
        addHabitLog,
        deleteHabitLog
    } = useHabitStore();

    useEffect(() => {
        if (user) {
            fetchHabitData(user.uid, HABIT_ID, DEFAULT_GOAL);
        }
    }, [user, fetchHabitData]);

    const habitData = habits[HABIT_ID];
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as any;
    const currentDayData = habitData?.days.find(d => d.day === currentDayName);

    const current = currentDayData?.total || 0;
    const goal = currentDayData?.goal || DEFAULT_GOAL;
    const percentage = Math.min(100, Math.round((current / goal) * 100));
    const remaining = Math.max(0, goal - current);

    const history = currentDayData ? [...currentDayData.logs].sort((a, b) => b.timestamp - a.timestamp) : [];

    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const completionData = daysOrder.map(day => {
        const dayData = habitData?.days.find(d => d.day === day);
        return dayData ? dayData.total >= dayData.goal : false;
    });

    const handleAddHabit = async (amount: number) => {
        if (user) {
            await addHabitLog(user.uid, HABIT_ID, amount, 'min', 'Zen Session');
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (user) {
            await deleteHabitLog(user.uid, HABIT_ID, logId);
        }
    };

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

                    <button
                        className="p-2 rounded-full transition-colors"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232, 130, 94, 0.2)' }}>
                        <Flower2 size={24} style={{ color: 'var(--accent-orange)' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Meditation
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            Daily Goal: {goal} Min
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 space-y-5">
                {/* Circular Progress */}
                <div className="flex items-center justify-center py-8">
                    <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="128"
                                cy="128"
                                r="110"
                                fill="none"
                                strokeWidth="20"
                                style={{ stroke: 'rgba(232, 130, 94, 0.2)' }}
                            />
                            <circle
                                cx="128"
                                cy="128"
                                r="110"
                                fill="none"
                                strokeWidth="20"
                                strokeLinecap="round"
                                style={{
                                    stroke: 'var(--accent-orange)',
                                    strokeDasharray: `${2 * Math.PI * 110}`,
                                    strokeDashoffset: `${2 * Math.PI * 110 * (1 - percentage / 100)}`,
                                    transition: 'stroke-dashoffset 0.5s ease',
                                }}
                            />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {current}
                            </span>
                            <span className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                minutes today
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    {[5, 10, 15].map(min => (
                        <button
                            key={min}
                            onClick={() => handleAddHabit(min)}
                            className="rounded-2xl p-4 border transition-all active:scale-95 hover:bg-[var(--bg-card-hover)]"
                            style={{
                                background: 'var(--bg-card)',
                                borderColor: 'var(--border-subtle)',
                            }}
                        >
                            <Clock size={24} className="mx-auto mb-2" style={{ color: 'var(--accent-orange)' }} />
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                +{min}m
                            </p>
                        </button>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div
                        className="rounded-2xl p-4 border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={14} style={{ color: 'var(--accent-orange)' }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                                STREAK
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                5
                            </span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                days
                            </span>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl p-4 border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} style={{ color: 'var(--accent-orange)' }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                                FOCUS
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {percentage}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Weekly Completion */}
                <div
                    className="rounded-2xl p-4 border"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                            Weekly Progress
                        </span>
                    </div>

                    <div className="flex justify-between gap-2">
                        {weekDays.map((day, idx) => (
                            <div
                                key={idx}
                                className="flex-1 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{
                                    background: completionData[idx] ? 'var(--accent-orange)' : 'rgba(90, 125, 94, 0.2)',
                                    color: completionData[idx] ? 'var(--bg-primary)' : 'var(--text-muted)',
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div>
                    <h3 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                        SESSION HISTORY
                    </h3>

                    <div className="space-y-3">
                        {history.length > 0 ? (
                            history.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-3 p-3 rounded-xl group relative"
                                    style={{ background: 'var(--bg-card)' }}
                                >
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(232, 130, 94, 0.2)' }}
                                    >
                                        <Clock size={20} style={{ color: 'var(--accent-orange)' }} />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                            {log.name}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            {log.time}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-base font-bold" style={{ color: 'var(--accent-orange)' }}>
                                            {log.amount}m
                                        </span>
                                        <button
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(232,90,90,0.1)]"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-[var(--text-muted)]">
                                No sessions logged yet today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
