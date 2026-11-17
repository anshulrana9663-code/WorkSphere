import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { employeeService } from '../services/employeeService';
import type { ApiTask } from '../types/apiTask';
import type { Employee } from '../types/employee';
import { CreateTaskDialog } from '../components/tasks/CreateTaskDialog';
import { GreetingBanner } from '../components/dashboard/GreetingBanner';
import { TaskStatCard } from '../components/dashboard/TaskStatCard';
import { TaskDistributionChart } from '../components/dashboard/TaskDistributionChart';
import { UpcomingMeetings } from '../components/dashboard/UpcomingMeetings';
import { RecentActivity, type ActivityItem } from '../components/dashboard/RecentActivity';
import {
  TasksIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  TeamsIcon,
} from '../components/common/Icons';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isManager, setIsManager] = useState<boolean>(false);
  const [subordinates, setSubordinates] = useState<Employee[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  useEffect(() => {
    employeeService
      .getSubordinates()
      .then((subs) => {
        const active = subs.filter((e) => e.isActive);
        setSubordinates(active);
        setIsManager(active.length > 0);
      })
      .catch(() => {
        setSubordinates([]);
        setIsManager(false);
      });
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load employee dashboard deliverables:', err);
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

  // Partition tasks into personal vs team deliverables
  const myTasks = useMemo(() => tasks.filter(isAssignedToMe), [tasks, isAssignedToMe]);
  const teamTasks = useMemo(() => tasks.filter((t) => !isAssignedToMe(t)), [tasks, isAssignedToMe]);
  const showTeamSection = isManager || teamTasks.length > 0;

  // Personal metrics for own deliverables
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = myTasks.filter(
    (t) => t.status === 'InProgress' || t.status === 'In Progress'
  ).length;
  const pendingTasks = myTasks.filter((t) => t.status === 'Pending').length;
  const overdueTasks = myTasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'Completed' &&
      new Date(t.dueDate) < new Date()
  ).length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingPercent = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const overduePercent = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

  // Team metrics (when managing direct reports)
  const teamTotal = teamTasks.length;
  const teamCompleted = teamTasks.filter((t) => t.status === 'Completed').length;
  const teamInProgress = teamTasks.filter(
    (t) => t.status === 'InProgress' || t.status === 'In Progress'
  ).length;
  const teamOverdue = teamTasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'Completed' &&
      new Date(t.dueDate) < new Date()
  ).length;

  const activities: ActivityItem[] = useMemo(() => {
    if (tasks.length === 0) return [];
    return [...tasks]
      .sort((a, b) => b.createdDate.localeCompare(a.createdDate))
      .slice(0, 4)
      .map((t) => {
        const authorName = t.assignedByName || user?.name || 'Leadership';
        const initials = authorName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        const isCompleted = t.status === 'Completed';

        return {
          id: `act-${t.id}`,
          user: {
            name: authorName,
            initials: initials || 'WS',
            bg: isCompleted ? 'bg-emerald-600' : 'bg-indigo-600',
          },
          action: isCompleted ? 'marked as completed' : 'updated deliverable',
          target: t.name,
          category: 'Engineering',
          timeAgo: 'Recently',
          type: (isCompleted ? 'completed' : 'created') as 'completed' | 'created',
        };
      });
  }, [tasks, user?.name]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Greeting Banner with Current User, Time & Date */}
      <GreetingBanner
        userName={user?.name ?? 'Alex Morgan'}
        subtitle={`Welcome to your WorkSphere hub. You have ${overdueTasks} urgent deadline${
          overdueTasks === 1 ? '' : 's'
        } and ${inProgressTasks} task${inProgressTasks === 1 ? '' : 's'} in progress.`}
      />

      {/* 2. Four Task Summary Metrics Cards */}
      <section aria-label="Task Summary Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <TaskStatCard
            title="My Tasks"
            count={loading ? '...' : totalTasks}
            subtitle="Assigned deliverables"
            icon={TasksIcon}
            variant="primary"
            trend={totalTasks > 0 ? `${totalTasks} active` : '0 active'}
            progressPercent={100}
          />
          <TaskStatCard
            title="Completed"
            count={loading ? '...' : completedTasks}
            subtitle={`${completionPercent}% milestone completion`}
            icon={CheckCircleIcon}
            variant="success"
            trend={`${completionPercent}%`}
            progressPercent={completionPercent}
          />
          <TaskStatCard
            title="Pending"
            count={loading ? '...' : pendingTasks}
            subtitle="Active sprint backlog"
            icon={ClockIcon}
            variant="warning"
            trend={`${pendingPercent}%`}
            progressPercent={pendingPercent}
          />
          <TaskStatCard
            title="Overdue"
            count={loading ? '...' : overdueTasks}
            subtitle={overdueTasks > 0 ? 'Action required promptly' : 'Deliverables on schedule'}
            icon={AlertCircleIcon}
            variant="danger"
            trend={`${overduePercent}%`}
            progressPercent={overduePercent}
          />
        </div>
      </section>

      {/* 2b. Team Deliverables Oversight Section (Visible when managing subordinates) */}
      {showTeamSection && (
        <section aria-label="Team Oversight Overview" className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <TeamsIcon size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Team Deliverables Overview</h2>
                <p className="text-xs text-slate-500">
                  Supervising {teamTotal} active deliverables across your direct reporting team
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>+</span>
                <span>Assign Task</span>
              </button>
              <Link
                to="/tasks?view=team"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>Manage Team Tasks</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-xs font-medium text-slate-500">Total Team Items</span>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{teamTotal}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-xs font-medium text-indigo-700">In Progress</span>
              <p className="text-2xl font-extrabold text-indigo-900 mt-0.5">{teamInProgress}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-medium text-emerald-700">Completed</span>
              <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{teamCompleted}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-medium text-rose-700">Overdue / Action Needed</span>
              <p className="text-2xl font-extrabold text-rose-900 mt-0.5">{teamOverdue}</p>
            </div>
          </div>
        </section>
      )}

      {/* 3. Recharts Visual Representation: Completed vs Pending vs In Progress */}
      <section aria-label="Task Visual Analytics">
        <TaskDistributionChart
          statusCounts={{
            completed: completedTasks,
            inProgress: inProgressTasks,
            pending: pendingTasks,
          }}
        />
      </section>

      {/* 4. Upcoming Meetings & Recent Activity */}
      <section aria-label="Meetings and Activity" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingMeetings />
        <RecentActivity activities={activities.length > 0 ? activities : undefined} />
      </section>

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
