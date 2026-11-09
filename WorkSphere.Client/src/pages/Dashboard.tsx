import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import type { ApiTask } from '../types/apiTask';
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
} from '../components/common/Icons';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const data = await taskService.getAll();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load employee dashboard deliverables:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'InProgress' || t.status === 'In Progress'
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'Completed' &&
      new Date(t.dueDate) < new Date()
  ).length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingPercent = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const overduePercent = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

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
    </div>
  );
}
