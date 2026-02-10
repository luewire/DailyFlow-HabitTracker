'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, Flame, PersonStanding, Trash2, Edit2, Plus, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useHabitStore } from '@/store/habitStore';
import { Button } from '@/components/ui/Button';
import { calculateStreak } from '@/lib/utils/streak';

const HABIT_ID = 'running';
const WEEKLY_GOAL = 5.0; // 5 km

export default function RunningDetailPage() {
    const router = useRouter();
    const { user } = useAuth();
    const {
        habits,
        fetchHabitData,
        addHabitLog,
        deleteHabitLog,
        getWeeklyTotal
    } = useHabitStore();

    const [showAddModal, setShowAddModal] = useState(false);
    const [distance, setDistance] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (user) {
            fetchHabitData(user.uid, HABIT_ID, 1.0); // Default daily goal 1km (though we focus on weekly)
        }
    }, [user, fetchHabitData]);

    const habitData = habits[HABIT_ID];
    const weeklyTotal = getWeeklyTotal(HABIT_ID);
    const percentage = Math.min(100, Math.round((weeklyTotal / WEEKLY_GOAL) * 100));

    // Get all logs for the week
    const allLogs = habitData?.days.flatMap(day =>
        day.logs.map(log => ({
            ...log,
            dayAbbr: day.day.substring(0, 3).toUpperCase(),
            dayName: day.day
        }))
    ).sort((a, b) => b.timestamp - a.timestamp) || [];

    const streak = habitData ? calculateStreak(habitData.days) : 0;

    const handleAddLog = async () => {
        if (user && distance) {
            const amount = parseFloat(distance);
            if (!isNaN(amount)) {
                await addHabitLog(user.uid, HABIT_ID, amount, 'km', description || 'Jogging');
                setDistance('');
                setDescription('');
                setShowAddModal(false);
            }
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
                <div className="flex items-center justify-between mb-6">
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

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                            Running
                        </h1>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            {streak} day streak • Activity
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-5 space-y-6">
                {/* Goal Card */}
                <div
                    className="rounded-[32px] p-6 border"
                    style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-subtle)',
                    }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0, 230, 118, 0.1)' }}>
                                <PersonStanding size={20} style={{ color: 'var(--accent-green)' }} />
                            </div>
                            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Weekly Goal</span>
                        </div>
                        <span className="text-2xl font-bold" style={{ color: 'var(--accent-green)' }}>{percentage}%</span>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>{weeklyTotal.toFixed(1)}</span>
                            <span className="text-lg opacity-40 font-bold" style={{ color: 'var(--text-primary)' }}>km</span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{WEEKLY_GOAL.toFixed(1)}</span>
                            <span className="text-sm ml-1 opacity-40 font-bold" style={{ color: 'var(--text-primary)' }}>km</span>
                            <p className="text-[10px] tracking-widest uppercase font-bold opacity-40" style={{ color: 'var(--text-primary)' }}>TARGET</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${percentage}%`,
                                background: 'var(--accent-green)',
                            }}
                        />
                    </div>
                </div>

                {/* Logs Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Running Logs</h2>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>This Week</span>
                    </div>

                    <div className="space-y-3">
                        {allLogs.length > 0 ? (
                            allLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center gap-4 p-4 rounded-[24px] border group relative"
                                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.4)' }}
                                    >
                                        {log.dayAbbr}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{log.amount.toFixed(1)} km</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{log.name}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500/50 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 rounded-[24px] border border-dashed" style={{ borderColor: 'var(--border-subtle)' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No runs logged this week</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setShowAddModal(true)}
                className="fixed bottom-24 right-6 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 z-50 hover:scale-110"
                style={{
                    background: 'var(--accent-green)',
                    boxShadow: '0 8px 32px rgba(0, 230, 118, 0.6)',
                }}
            >
                <Plus size={32} style={{ color: 'var(--bg-primary)' }} strokeWidth={3} />
            </button>

            {/* Add Log Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div
                        className="relative w-full max-w-sm rounded-[32px] p-8 border animate-scale-up"
                        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                    >
                        <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Log Run</h3>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-bold tracking-widest uppercase mb-2 block opacity-40">Distance (km)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-xl font-bold focus:outline-none focus:border-[var(--accent-green)] transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold tracking-widest uppercase mb-2 block opacity-40">Session Name</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Morning Run"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-base focus:outline-none focus:border-[var(--accent-green)] transition-colors"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/5 text-sm font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddLog}
                                className="flex-1 py-4 rounded-2xl text-sm font-bold shadow-lg"
                                style={{ background: 'var(--accent-green)', color: 'var(--bg-primary)' }}
                            >
                                Log Run
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
