import { useLocation } from 'react-router-dom';
import { MenuIcon, BellIcon } from '../common/Icons';
import { UserProfileMenu } from './UserProfileMenu';

interface TopNavbarProps {
  onMenuToggle: () => void;
  isSidebarCollapsed?: boolean;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Workspace Overview & Hub Metrics' },
  '/dashboard': { title: 'Dashboard', subtitle: 'Workspace Overview & Hub Metrics' },
  '/tasks': { title: 'My Tasks', subtitle: 'Assigned Items & Task Backlog' },
  '/teams': { title: 'Teams', subtitle: 'Directory & Collaboration Channels' },
  '/calendar': { title: 'Calendar', subtitle: 'Schedules, Deadlines & Events' },
  '/meetings': { title: 'Meetings', subtitle: 'Conference Rooms & Video Syncs' },
  '/reports': { title: 'Reports', subtitle: 'Productivity Logs & Analytics' },
  '/notifications': { title: 'Notifications', subtitle: 'Activity Feed & System Alerts' },
  '/settings': { title: 'Settings', subtitle: 'Workspace & Hub Preferences' },
  '/performance': { title: 'Performance', subtitle: 'Score, trends & review history' },
  '/admin/dashboard': { title: 'Admin Dashboard', subtitle: 'Overview & Team Management' },
  '/admin/tasks/create': { title: 'Create Task', subtitle: 'Assign a new task to an employee' },
  '/admin/tasks': { title: 'Task Management', subtitle: 'All tasks, filters & inline edit' },
  '/admin/reviews': { title: 'Employee Reviews', subtitle: 'Rate and review your team' },
  '/admin/settings': { title: 'Settings', subtitle: 'Profile, theme & preferences' },
};

export function TopNavbar({ onMenuToggle, isSidebarCollapsed = false }: TopNavbarProps) {
  const location = useLocation();

  const currentRouteMeta =
    ROUTE_TITLES[location.pathname] || {
      title: 'WorkSphere Hub',
      subtitle: 'Employee Productivity Hub',
    };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left side: Sidebar Toggle button & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Toggle navigation sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Toggle sidebar'}
        >
          <MenuIcon size={22} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {currentRouteMeta.title}
          </h1>
          {currentRouteMeta.subtitle && (
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate">
              {currentRouteMeta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Notification Icon and Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Icon */}
        <div className="relative">
          <button
            type="button"
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            aria-label="View notifications (3 unread)"
          >
            <BellIcon size={20} />
            {/* Ping animation indicator */}
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

        {/* Employee Profile Section */}
        <UserProfileMenu />
      </div>
    </header>
  );
}
