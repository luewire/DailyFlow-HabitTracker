'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, Flame, Clock, Droplet, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useWaterStore } from '@/store/waterStore';

export default function WaterDetailPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        weeklyWater,
        fetchWeeklyWater,
        addWater,
        deleteWaterLog
    } = useWaterStore();

    useEffect(() => {
        if (user) {
            fetchWeeklyWater(user.uid);
        }
    }, [user, fetchWeeklyWater]);

    // Data from store
    const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as any;
    const currentDayData = weeklyWater?.days.find(d => d.day === currentDayName);

    const current = currentDayData ? currentDayData.total / 1000 : 0; // Convert to Liters
    const goal = 2.5; // Fixed goal for now, could be dynamic
    const percentage = Math.min(100, Math.round((current / goal) * 100));
    const remaining = Math.max(0, (goal * 1000) - (current * 1000));

    // Sort logs by newest first
    const history = currentDayData ? [...currentDayData.logs].sort((a, b) => b.timestamp - a.timestamp) : [];

    // Weekly completion for chart
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const completionData = daysOrder.map(day => {
        const dayData = weeklyWater?.days.find(d => d.day === day);
        return dayData ? dayData.total >= dayData.goal : false;
    });

    const handleAddWater = async (amount: number) => {
        if (user) {
            await addWater(user.uid, amount);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (user) {
            await deleteWaterLog(user.uid, logId);
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

                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Drink Water
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Hydration Goal
                    </p>
                </div>
            </div>

            <div className="px-5 space-y-5">
                {/* Circular Progress */}
                <div className="flex items-center justify-center py-8">
                    <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx="128"
                                cy="128"
                                r="110"
                                fill="none"
                                strokeWidth="20"
                                style={{ stroke: 'rgba(74, 144, 217, 0.2)' }}
                            />
                            {/* Progress circle */}
                            <circle
                                cx="128"
                                cy="128"
                                r="110"
                                fill="none"
                                strokeWidth="20"
                                strokeLinecap="round"
                                style={{
                                    stroke: '#4A90D9',
                                    strokeDasharray: `${2 * Math.PI * 110}`,
                                    strokeDashoffset: `${2 * Math.PI * 110 * (1 - percentage / 100)}`,
                                    transition: 'stroke-dashoffset 0.5s ease',
                                }}
                            />
                            {/* Inner fill - water level effect */}
                            <circle
                                cx="128"
                                cy={128 + (110 * (1 - percentage / 100))}
                                r={110 * (percentage / 100)}
                                style={{ fill: 'rgba(74, 144, 217, 0.3)' }}
                            />
                        </svg>

                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {current.toFixed(1)}
                            </span>
                            <span className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                / {goal} Liters
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleAddWater(250)}
                        className="rounded-2xl p-4 border transition-all active:scale-95 hover:bg-[var(--bg-card-hover)]"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <Droplet size={24} className="mx-auto mb-2" style={{ color: '#4A90D9' }} />
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            +250ml
                        </p>
                    </button>

                    <button
                        onClick={() => handleAddWater(500)}
                        className="rounded-2xl p-4 border transition-all active:scale-95 hover:bg-[var(--bg-card-hover)]"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <Droplet size={24} className="mx-auto mb-2" style={{ color: '#4A90D9' }} />
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            +500ml
                        </p>
                    </button>

                    <button
                        onClick={() => handleAddWater(100)}
                        className="rounded-2xl p-4 border transition-all active:scale-95 hover:bg-[var(--bg-card-hover)]"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-subtle)',
                        }}
                    >
                        <Droplet size={24} className="mx-auto mb-2" style={{ color: '#4A90D9' }} />
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            +100ml
                        </p>
                    </button>
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
                                {weeklyWater ? '3' : '-'}
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
                            <Clock size={14} style={{ color: '#4A90D9' }} />
                            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                                LEFT TODAY
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                {remaining}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                ml
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
                            Weekly Completion
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
                            {percentage}%
                        </span>
                    </div>

                    <div className="flex justify-between gap-2">
                        {weekDays.map((day, idx) => (
                            <div
                                key={idx}
                                className="flex-1 h-12 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{
                                    background: completionData[idx] ? 'var(--accent-green)' : 'rgba(90, 125, 94, 0.2)',
                                    color: completionData[idx] ? 'var(--bg-primary)' : 'var(--text-muted)',
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today's History */}
                <div>
                    <h3 className="text-xs font-bold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                        TODAY'S HISTORY
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
                                        style={{ background: 'rgba(74, 144, 217, 0.2)' }}
                                    >
                                        <Droplet size={20} style={{ color: '#4A90D9' }} />
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
                                        <span className="text-base font-bold" style={{ color: '#4A90D9' }}>
                                            +{log.amount}ml
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
                                No water logged yet today.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
