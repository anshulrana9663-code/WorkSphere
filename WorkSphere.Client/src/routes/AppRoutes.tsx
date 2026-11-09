import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Auth pages
import LoginEntryPage from '../pages/LoginEntryPage';
import EmployeeLoginPage from '../pages/EmployeeLoginPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

// Employee pages
import DashboardPage from '../pages/DashboardPage';
import TasksPage from '../pages/TasksPage';
import PerformancePage from '../pages/PerformancePage';
import SettingsPage from '../pages/SettingsPage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminEmployeesPage from '../pages/admin/AdminEmployeesPage';
import AdminCreateEmployeeAccountPage from '../pages/admin/AdminCreateEmployeeAccountPage';
import AdminCreateTaskPage from '../pages/admin/AdminCreateTaskPage';
import AdminTaskListPage from '../pages/admin/AdminTaskListPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Guest-only auth routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginEntryPage />} />
        <Route path="/login/employee" element={<EmployeeLoginPage />} />
        <Route path="/login/admin" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Employee portal */}
      <Route element={<ProtectedRoute requiredRole="Employee" />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Admin portal */}
      <Route element={<ProtectedRoute requiredRole="Admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/employees" element={<AdminEmployeesPage />} />
          <Route path="/admin/employees/create-account" element={<AdminCreateEmployeeAccountPage />} />
          <Route path="/admin/tasks/create" element={<AdminCreateTaskPage />} />
          <Route path="/admin/tasks" element={<AdminTaskListPage />} />
          <Route path="/admin/reviews" element={<AdminReviewsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
