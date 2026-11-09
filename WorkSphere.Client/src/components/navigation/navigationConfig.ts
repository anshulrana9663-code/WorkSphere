import type { NavSectionConfig } from '../../types/navigation';
import {
  DashboardIcon,
  TasksIcon,
  SettingsIcon,
  ActivityIcon,
  ReportsIcon,
  TeamsIcon,
} from '../common/Icons';

export const EMPLOYEE_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
      { id: 'tasks', label: 'My Tasks', href: '/tasks', icon: TasksIcon, badge: 8, badgeVariant: 'primary' },
      { id: 'performance', label: 'Performance', href: '/performance', icon: ActivityIcon },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', href: '/settings', icon: SettingsIcon },
    ],
  },
];

export const ADMIN_NAV_SECTIONS: NavSectionConfig[] = [
  {
    title: 'Admin',
    items: [
      { id: 'admin-dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
      { id: 'admin-employees', label: 'Employees', href: '/admin/employees', icon: TeamsIcon },
      { id: 'admin-create-employee', label: 'Create Account', href: '/admin/employees/create-account', icon: TeamsIcon },
      { id: 'admin-tasks-create', label: 'Create Task', href: '/admin/tasks/create', icon: TasksIcon },
      { id: 'admin-tasks', label: 'Task List', href: '/admin/tasks', icon: ReportsIcon },
      { id: 'admin-reviews', label: 'Reviews', href: '/admin/reviews', icon: ActivityIcon },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'admin-settings', label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ],
  },
];

// Keep old export for backward compatibility
export const NAVIGATION_SECTIONS = EMPLOYEE_NAV_SECTIONS;
