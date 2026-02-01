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
import { MotivationalQuote } from '@/components/dashboard/MotivationalQuote';
import { MonthlyWorkoutProgress } from '@/components/dashboard/MonthlyWorkoutProgress';
import { DesktopNav } from '@/components/layout/DesktopNav';
import { Plus, Filter } from 'lucide-react';
import { Priority, Task } from '@/types';

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

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  const filteredTasks = filterPriority === 'all'
    ? tasks
    : tasks.filter(t => t.priority === filterPriority);

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

    // Update order property
    const updatedTasks = items.map((task, index) => ({
      ...task,
      order: index,
    }));

    reorderTasks(user.uid, updatedTasks);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
          <TaskSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <DesktopNav />

      {/* Top Section: Note & Progress */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <MotivationalQuote />
        <MonthlyWorkoutProgress />
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Tasks</h2>
            <p className="text-gray-600 mt-1">
              {tasks.filter(t => !t.completed).length} pending tasks
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </Button>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={20} className="text-gray-600" />
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => setFilterPriority(priority)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filterPriority === priority
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {priority === 'all' ? 'All' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="mb-6">
            <AddTaskForm
              onAdd={handleAddTask}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No tasks yet"
            description="Create your first task to get started with your productivity journey!"
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
      </div>
    </div>
  );
}
