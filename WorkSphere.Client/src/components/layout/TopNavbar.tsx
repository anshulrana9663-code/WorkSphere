import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuIcon, SearchIcon, BellIcon } from '../common/Icons';
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
  const [searchValue, setSearchValue] = useState('');

  const currentRouteMeta =
    ROUTE_TITLES[location.pathname] || {
      title: 'WorkSphere Hub',
      subtitle: 'Employee Productivity Hub',
    };

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left side: Sidebar Toggle button & Page Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
          aria-label={isSidebarCollapsed ? 'Expand navigation sidebar' : 'Toggle navigation sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Toggle sidebar'}
        >
          <MenuIcon size={22} />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
            {currentRouteMeta.title}
          </h1>
          {currentRouteMeta.subtitle && (
            <p className="hidden md:block text-xs text-slate-500 truncate">
              {currentRouteMeta.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Search bar, Notification Icon, and Employee Profile */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search tasks, teams, files..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              aria-label="Clear search"
            >
              &times;
            </button>
          ) : (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <kbd className="hidden lg:inline-flex items-center rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-400 bg-white">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Mobile search button indicator if on small screens */}
        <button
          type="button"
          className="sm:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          aria-label="Search"
        >
          <SearchIcon size={20} />
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button
            type="button"
            className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
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
        <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

        {/* Employee Profile Section */}
        <UserProfileMenu />
      </div>
    </header>
  );
}
