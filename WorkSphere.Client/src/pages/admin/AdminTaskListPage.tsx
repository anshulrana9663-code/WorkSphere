import { useState, useMemo, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { employeeService } from '../../services/employeeService';
import type { ApiTask } from '../../types/apiTask';
import type { Employee } from '../../types/employee';
import type { Task, TaskPriority, TaskStatus } from '../../types/task';
import { TaskDetailDialog } from '../../components/tasks/TaskDetailDialog';
import {
  SearchIcon,
  FilterIcon,
  EyeIcon,
  ArrowUpDownIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from '../../components/common/Icons';

const PRIORITY_BADGES: Record<TaskPriority, string> = {
  Urgent: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  High: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Medium: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  Low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_BADGES: Record<TaskStatus, string> = {
  'In Progress': 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pending: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Overdue: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  Blocked: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
};

const STATUS_CODE_MAP: Record<TaskStatus, number> = {
  Pending: 0,
  'In Progress': 1,
  Completed: 3,
  Overdue: 0,
  Blocked: 4,
};

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
    assignedTo: t.assignedToName || 'Unassigned',
    priority: (t.priority as TaskPriority) || 'Medium',
    dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
    status: statusLabel,
    category: 'Deliverable',
    createdAt: t.createdDate ? t.createdDate.split('T')[0] : '',
  };
}

export default function AdminTaskListPage() {
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Reassign state
  const [reassignTaskId, setReassignTaskId] = useState<string | null>(null);
  const [newAssigneeId, setNewAssigneeId] = useState<string>('');

  const fetchTasksAndEmployees = async () => {
    setLoading(true);
    try {
      const [tasksData, empsData] = await Promise.all([
        taskService.getAll(),
        employeeService.getAll(),
      ]);
      setApiTasks(tasksData);
      setEmployees(empsData.filter((e) => e.isActive));
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load task list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndEmployees();
  }, []);

  const tasks: Task[] = useMemo(() => {
    return apiTasks.map(mapApiTaskToUi);
  }, [apiTasks]);

  // Handle inline status update
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const rawId = parseInt(taskId.replace('WS-', ''), 10);
    const statusCode = STATUS_CODE_MAP[newStatus] ?? 0;
    try {
      await taskService.updateStatus(rawId, { status: statusCode });
      setApiTasks((prev) =>
        prev.map((t) => (t.id === rawId ? { ...t, status: newStatus.replace(' ', '') } : t))
      );
      setFeedback({ type: 'success', message: `Task #${rawId} status updated to ${newStatus}.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update status.',
      });
    }
  };

  // Handle reassign
  const handleReassign = async (taskId: string) => {
    if (!newAssigneeId) return;
    const rawId = parseInt(taskId.replace('WS-', ''), 10);
    const currentTask = apiTasks.find((t) => t.id === rawId);
    if (!currentTask) return;

    try {
      const assignedToIdNum = parseInt(newAssigneeId, 10);
      await taskService.update(rawId, {
        name: currentTask.name,
        description: currentTask.description,
        assignedToId: assignedToIdNum,
        dueDate: currentTask.dueDate,
        priority: currentTask.priority === 'Urgent' ? 3 : currentTask.priority === 'High' ? 2 : currentTask.priority === 'Low' ? 0 : 1,
      });

      const assignedEmp = employees.find((e) => e.id === assignedToIdNum);
      setApiTasks((prev) =>
        prev.map((t) =>
          t.id === rawId
            ? { ...t, assignedToId: assignedToIdNum, assignedToName: assignedEmp?.name }
            : t
        )
      );
      setReassignTaskId(null);
      setFeedback({ type: 'success', message: `Task reassigned successfully.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to reassign task.',
      });
    }
  };

  // Handle delete
  const handleDeleteTask = async (taskId: string) => {
    const rawId = parseInt(taskId.replace('WS-', ''), 10);
    if (!window.confirm(`Are you sure you want to delete task #${rawId}?`)) return;

    try {
      await taskService.delete(rawId);
      setApiTasks((prev) => prev.filter((t) => t.id !== rawId));
      setFeedback({ type: 'success', message: `Task #${rawId} deleted.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete task.',
      });
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === 'all' || task.assignedTo === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  const allAssignees = useMemo(() => {
    const names = new Set(tasks.map((t) => t.assignedTo));
    return Array.from(names);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, filter, reassign, and update status for all deliverables.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
          <span>{filteredTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm font-medium flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircleIcon size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircleIcon size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <SearchIcon size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, assignee..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-3 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Assignees</option>
              {allAssignees.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters shortcut */}
        {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Active filters applied</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setAssigneeFilter('all');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Task Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading task registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Task ID</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status (Edit)</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <FilterIcon size={28} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-slate-600">No tasks matched your filters</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting the filter criteria or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Task ID */}
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">
                        {task.id}
                      </td>

                      {/* Title */}
                      <td className="px-5 py-4 max-w-xs sm:max-w-md">
                        <button
                          type="button"
                          onClick={() => setSelectedTask(task)}
                          className="text-left font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate block max-w-full cursor-pointer"
                          title={task.title}
                        >
                          {task.title}
                        </button>
                        <span className="text-[11px] text-slate-400">{task.category}</span>
                      </td>

                      {/* Assignee & Inline Reassign */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {reassignTaskId === task.id ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={newAssigneeId}
                              onChange={(e) => setNewAssigneeId(e.target.value)}
                              className="rounded-lg border border-indigo-300 bg-white py-1 px-2 text-xs text-slate-800"
                            >
                              <option value="">Select Assignee</option>
                              {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleReassign(task.id)}
                              className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setReassignTaskId(null)}
                              className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{task.assignedTo}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setReassignTaskId(task.id);
                                setNewAssigneeId('');
                              }}
                              className="text-slate-400 hover:text-indigo-600 text-xs cursor-pointer p-0.5 rounded hover:bg-slate-100"
                              title="Reassign Task"
                            >
                              <ArrowUpDownIcon size={13} />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            PRIORITY_BADGES[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value as TaskStatus)
                          }
                          className={`rounded-lg py-1 px-2 text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500/20 ${
                            STATUS_BADGES[task.status]
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </td>

                      {/* Due Date */}
                      <td
                        className={`px-5 py-4 text-xs whitespace-nowrap font-medium ${
                          task.status === 'Overdue' ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {task.dueDate}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            <EyeIcon size={13} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Task"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Details Dialog Modal */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
