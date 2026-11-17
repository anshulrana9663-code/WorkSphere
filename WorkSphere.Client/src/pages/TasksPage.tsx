import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TaskSummaryHeader } from '../components/tasks/TaskSummaryHeader';
import { TaskTable } from '../components/tasks/TaskTable';
import { CreateTaskDialog } from '../components/tasks/CreateTaskDialog';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';
import type { Task, TaskPriority, TaskStatus } from '../types/task';
import type { ApiTask } from '../types/apiTask';
import type { Employee } from '../types/employee';

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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const initialScope = searchParams.get('view') === 'team' ? 'team' : 'my';
  const [scopeFilter, setScopeFilter] = useState<'my' | 'team' | 'all'>(initialScope);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subordinates, setSubordinates] = useState<Employee[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  useEffect(() => {
    employeeService
      .getSubordinates()
      .then((subs) => setSubordinates(subs.filter((e) => e.isActive)))
      .catch(() => setSubordinates([]));
  }, []);

  const isManager = subordinates.length > 0;

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

  const currentEmpId = user?.id ? parseInt(user.id, 10) : null;
  const isAssignedToMe = useCallback(
    (t: ApiTask) =>
      (currentEmpId != null && t.assignedToId === currentEmpId) ||
      (user?.name && t.assignedToName?.trim().toLowerCase() === user.name.trim().toLowerCase()),
    [currentEmpId, user?.name]
  );

  const myApiTasks = useMemo(() => apiTasks.filter(isAssignedToMe), [apiTasks, isAssignedToMe]);
  const teamApiTasks = useMemo(() => apiTasks.filter((t) => !isAssignedToMe(t)), [apiTasks, isAssignedToMe]);
  const showManagerTabs = isManager || teamApiTasks.length > 0;

  const scopedApiTasks = useMemo(() => {
    if (!showManagerTabs) return apiTasks;
    if (scopeFilter === 'team') return teamApiTasks;
    if (scopeFilter === 'all') return apiTasks;
    return myApiTasks;
  }, [showManagerTabs, scopeFilter, apiTasks, myApiTasks, teamApiTasks]);

  const displayTasks: Task[] = useMemo(() => {
    return scopedApiTasks.map(mapApiTaskToUi);
  }, [scopedApiTasks]);

  const scopeTitle =
    !showManagerTabs || scopeFilter === 'my'
      ? 'My Tasks Backlog'
      : scopeFilter === 'team'
      ? 'Team Deliverables Backlog'
      : 'Combined Workspace Backlog';

  const scopeBadge =
    !showManagerTabs || scopeFilter === 'my'
      ? `Assigned to ${user?.name || 'Me'}`
      : scopeFilter === 'team'
      ? 'Team Oversight'
      : 'All Workspace Tasks';

  const scopeDescription =
    !showManagerTabs || scopeFilter === 'my'
      ? 'Track, prioritize, and manage all work items directly assigned to your profile.'
      : scopeFilter === 'team'
      ? 'Oversee, prioritize, and manage deliverables assigned across your reporting team.'
      : 'Complete overview of both your personal deliverables and team assignments.';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Scope Selector for Managers with Subordinates */}
      {showManagerTabs && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setScopeFilter('my');
                setSearchParams({});
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                scopeFilter === 'my'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👤 Assigned to Me</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  scopeFilter === 'my'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {myApiTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScopeFilter('team');
                setSearchParams({ view: 'team' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                scopeFilter === 'team'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👥 Team Deliverables</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  scopeFilter === 'team'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {teamApiTasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setScopeFilter('all');
                setSearchParams({ view: 'all' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                scopeFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋 All Tasks</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  scopeFilter === 'all'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {apiTasks.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-slate-500 font-medium px-2 hidden md:inline">
              {scopeFilter === 'team'
                ? `Supervising ${teamApiTasks.length} direct report deliverables`
                : scopeFilter === 'all'
                ? 'Viewing all workspace tasks'
                : 'Viewing your personal deliverables'}
            </span>

            {subordinates.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>+</span>
                <span>Assign Task</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Header with quick-filter stat cards */}
      <TaskSummaryHeader
        tasks={displayTasks}
        activeStatusFilter={statusFilter}
        onStatusFilterChange={(status) => setStatusFilter(status)}
        scopeTitle={scopeTitle}
        scopeBadge={scopeBadge}
        scopeDescription={scopeDescription}
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

      {/* Create Task Modal for Managers */}
      <CreateTaskDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={loadTasks}
        subordinates={subordinates}
      />
    </div>
  );
}
