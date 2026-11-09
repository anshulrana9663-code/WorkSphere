import { useState, useEffect, useMemo, useCallback } from 'react';
import { TaskSummaryHeader } from '../components/tasks/TaskSummaryHeader';
import { TaskTable } from '../components/tasks/TaskTable';
import { taskService } from '../services/taskService';
import type { Task, TaskPriority, TaskStatus } from '../types/task';
import type { ApiTask } from '../types/apiTask';

function mapApiTaskToUi(t: ApiTask): Task {
  let statusLabel: TaskStatus = 'Pending';
  if (t.status === 'InProgress' || t.status === 'In Progress') statusLabel = 'In Progress';
  else if (t.status === 'Completed') statusLabel = 'Completed';
  else if (t.status === 'Cancelled') statusLabel = 'Blocked';
  else if (t.status === 'Pending') statusLabel = 'Pending';

  const isOverdue =
    t.dueDate &&
    statusLabel !== 'Completed' &&
    new Date(t.dueDate) < new Date();
  if (isOverdue) {
    statusLabel = 'Overdue';
  }

  return {
    id: `WS-${t.id}`,
    title: t.name,
    description: t.description || '',
    assignedBy: {
      name: t.assignedByName || 'Manager',
      email: '',
      role: 'Assigner',
      avatarColor: 'bg-emerald-600',
      initials: t.assignedByName
        ? t.assignedByName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'WS',
    },
    assignedTo: t.assignedToName || 'Alex Morgan',
    priority: (t.priority as TaskPriority) || 'Medium',
    dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
    status: statusLabel,
    category: 'Engineering',
    createdAt: t.createdDate ? t.createdDate.split('T')[0] : '',
  };
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getAll();
      setApiTasks(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not fetch tasks from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const displayTasks: Task[] = useMemo(() => {
    return apiTasks.map(mapApiTaskToUi);
  }, [apiTasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Summary Header with quick-filter stat cards */}
      <TaskSummaryHeader
        tasks={displayTasks}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={(status) => setStatusFilter(status)}
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 font-medium">
          {error}
        </div>
      )}

      {/* Task Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Task List</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any row or the View button to see full task details, comments, and attachments.
            </p>
          </div>
          {loading && (
            <span className="text-xs text-slate-400">Syncing deliverables...</span>
          )}
        </div>

        <TaskTable tasks={displayTasks} statusFilter={statusFilter} />
      </div>
    </div>
  );
}
