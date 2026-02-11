'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTaskStore } from '@/store/taskStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskItem } from '@/components/tasks/TaskItem';
import { AddTaskForm } from '@/components/tasks/AddTaskForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TaskSkeleton } from '@/components/ui/SkeletonLoader';
import { Plus, ChevronRight, ChevronLeft, ClipboardList, X } from 'lucide-react';
import { Priority, Task } from '@/types';

// Get week days starting from Monday
const getWeekDays = () => {
  const days = [];
  const today = new Date();
  const currentDay = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const monday = new Date(today);

  // Adjust to Monday (if today is Sunday, go back 6 days, otherwise go back currentDay-1 days)
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  monday.setDate(today.getDate() - daysToMonday);

  for (let i = 0; i < 5; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(day);
  }

  return days;
};
const QUOTES = [
  { text: "By any means necessary", author: "Malcolm X" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", author: "Q.S. Al-Baqarah: 286" }
];

export default function TasksPage() {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    filterPriority,
    setFilterPriority,
    fetchTasks,
    addTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
  } = useTaskStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number | null>(null);
  const weekDays = getWeekDays();
  const today = new Date().getDate();

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  const filteredTasks = filterPriority === 'all'
    ? tasks
    : tasks.filter(t => t.priority === filterPriority);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remaining = totalCount - completedCount;

  const handleAddTask = async (title: string, priority: Priority, dueDate?: string) => {
    if (user) {
      await addTask(user.uid, title, priority, dueDate);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !user) return;

    const items = Array.from(filteredTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedTasks = items.map((task, index) => ({
      ...task,
      order: index,
    }));

    reorderTasks(user.uid, updatedTasks);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="py-6">
        <div className="space-y-4">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6">
      {/* Header and Quote */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Tasks
        </h1>
        <div className="flex flex-col">
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            "{quote.text}"
          </p>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--accent-green)' }}>
            — {quote.author}
          </p>
        </div>
      </div>

      {/* Month Label */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          className="text-sm font-medium flex items-center gap-1"
          style={{ color: 'var(--accent-green)' }}
          onClick={() => {
            setShowCalendar(!showCalendar);
            setCalendarMonth(new Date().getMonth());
            setCalendarYear(new Date().getFullYear());
            setSelectedCalendarDate(null);
          }}
        >
          {showCalendar ? 'Hide Calendar' : 'View Calendar'}
          {showCalendar ? <X size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Calendar */}
      {showCalendar && (() => {
        const firstDay = new Date(calendarYear, calendarMonth, 1);
        const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
        const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday-based
        const daysInMonth = lastDay.getDate();
        const todayDate = new Date();
        const isCurrentMonth = calendarMonth === todayDate.getMonth() && calendarYear === todayDate.getFullYear();
        const monthName = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        // Count tasks per day - use dueDate if available, otherwise createdAt
        const tasksByDay: Record<number, { total: number; completed: number }> = {};
        tasks.forEach(t => {
          const d = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
          if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
            const day = d.getDate();
            if (!tasksByDay[day]) tasksByDay[day] = { total: 0, completed: 0 };
            tasksByDay[day].total++;
            if (t.completed) tasksByDay[day].completed++;
          }
        });

        const cells = [];
        for (let i = 0; i < startDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);

        return (
          <div
            className="rounded-2xl p-4 sm:p-5 mb-4 border overflow-hidden animate-slide-down"
            style={{
              background: 'linear-gradient(145deg, rgba(20, 35, 25, 0.95), rgba(12, 22, 15, 0.98))',
              borderColor: 'rgba(0, 230, 118, 0.08)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); }
                  else setCalendarMonth(m => m - 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <ChevronLeft size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {monthName}
              </h3>
              <button
                onClick={() => {
                  if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); }
                  else setCalendarMonth(m => m + 1);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-[9px] sm:text-[10px] font-bold tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`e-${idx}`} className="aspect-square" />;

                const isToday = isCurrentMonth && day === todayDate.getDate();
                const info = tasksByDay[day];
                const hasTask = info && info.total > 0;
                const allDone = hasTask && info.completed === info.total;

                return (
                  <div
                    key={`d-${day}`}
                    className="aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all cursor-pointer"
                    onClick={() => setSelectedCalendarDate(selectedCalendarDate === day ? null : day)}
                    style={{
                      background: selectedCalendarDate === day
                        ? 'rgba(0, 230, 118, 0.25)'
                        : isToday
                          ? 'rgba(0, 230, 118, 0.15)'
                          : hasTask
                            ? 'rgba(255, 255, 255, 0.04)'
                            : 'rgba(255, 255, 255, 0.02)',
                      border: selectedCalendarDate === day
                        ? '1.5px solid rgba(0, 230, 118, 0.7)'
                        : isToday
                          ? '1.5px solid rgba(0, 230, 118, 0.5)'
                          : '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    <span
                      className="text-xs sm:text-sm font-medium"
                      style={{
                        color: selectedCalendarDate === day || isToday ? '#00E676' : hasTask ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {day}
                    </span>
                    {/* Task indicator dots */}
                    {hasTask && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(info.total, 3) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full"
                            style={{
                              background: i < info.completed ? '#00E676' : 'rgba(255,255,255,0.2)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00E676' }} />
                <span className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
                <span className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Pending</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-3 h-3 rounded border" style={{ borderColor: 'rgba(0,230,118,0.5)', background: 'rgba(0,230,118,0.15)' }} />
                <span className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Today</span>
              </div>
            </div>

            {/* Selected date tasks */}
            {selectedCalendarDate && (() => {
              const dayTasks = tasks.filter(t => {
                const d = t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt);
                return d.getDate() === selectedCalendarDate && d.getMonth() === calendarMonth && d.getFullYear() === calendarYear;
              });

              return (
                <div className="mt-4 pt-4 border-t animate-fade-in" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      Tasks on {selectedCalendarDate} {firstDay.toLocaleString('en-US', { month: 'short' })}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(0,230,118,0.1)', color: 'var(--accent-green)' }}>
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No tasks on this date</p>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: t.completed ? '#00E676' : t.priority === 'high' ? '#FF5252' : t.priority === 'medium' ? '#FFB74D' : 'rgba(255,255,255,0.3)' }} />
                          <span className={`text-xs sm:text-sm flex-1 ${t.completed ? 'line-through' : ''}`}
                            style={{ color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {t.title}
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-medium"
                            style={{ color: t.completed ? '#00E676' : 'var(--text-muted)' }}>
                            {t.completed ? '✓ Done' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Calendar Week Strip */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 no-scrollbar">
        {weekDays.map((date, idx) => {
          const isToday = date.getDate() === today;
          const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

          return (
            <button
              key={idx}
              className="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] h-[60px] sm:h-[70px] rounded-xl sm:rounded-2xl transition-all duration-200"
              style={{
                background: isToday ? 'var(--accent-green)' : 'var(--bg-card)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: isToday ? 'var(--accent-green)' : 'var(--border-subtle)',
              }}
            >
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-wider mb-0.5 sm:mb-1"
                style={{ color: isToday ? 'var(--bg-primary)' : 'var(--text-muted)' }}
              >
                {dayNames[idx]}
              </span>
              <span
                className="text-lg sm:text-xl font-bold"
                style={{ color: isToday ? 'var(--bg-primary)' : 'var(--text-primary)' }}
              >
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Today's Progress Card */}
      <div
        className="rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 border"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <h3 className="text-sm sm:text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Today's Progress
        </h3>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] sm:text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              {completedCount} of {totalCount} tasks completed
            </p>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold"
              style={{
                background: 'rgba(0, 230, 118, 0.15)',
                color: 'var(--accent-green)',
              }}
            >
              <svg width="6" height="6" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" fill="currentColor" />
              </svg>
              ON TRACK
            </div>
          </div>

          {/* Circular Progress */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                strokeWidth="6"
                style={{ stroke: 'var(--border-subtle)' }}
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                style={{
                  stroke: 'var(--accent-green)',
                  strokeDasharray: `${2 * Math.PI * 38}`,
                  strokeDashoffset: `${2 * Math.PI * 38 * (1 - percentage / 100)}`,
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 no-scrollbar">
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p as Priority | 'all')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all border whitespace-nowrap"
            style={{
              background: filterPriority === p
                ? (p === 'high' ? 'rgba(239, 68, 68, 0.15)' : p === 'medium' ? 'rgba(245, 158, 11, 0.15)' : p === 'low' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 230, 118, 0.15)')
                : 'var(--bg-card)',
              borderColor: filterPriority === p
                ? (p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : p === 'low' ? '#3b82f6' : 'var(--accent-green)')
                : 'var(--border-subtle)',
              color: filterPriority === p
                ? (p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : p === 'low' ? '#3b82f6' : 'var(--accent-green)')
                : 'var(--text-muted)',
            }}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Your Tasks Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Your Tasks
        </h3>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {remaining} Remaining
        </span>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="mb-4 animate-slide-down">
          <AddTaskForm
            onAdd={handleAddTask}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No tasks yet"
          description="Create your first task to get started!"
          action={
            !showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                Create Task
              </Button>
            )
          }
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        <TaskItem
                          task={task}
                          onToggle={toggleComplete}
                          onDelete={deleteTask}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* FAB Add Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed bottom-28 right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95 z-40"
          style={{
            background: 'var(--accent-green)',
            color: 'var(--bg-primary)',
            boxShadow: '0 8px 24px rgba(0, 230, 118, 0.4)',
          }}
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}