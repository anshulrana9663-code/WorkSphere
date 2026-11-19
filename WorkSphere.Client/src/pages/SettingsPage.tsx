import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { SunIcon, MoonIcon, SettingsIcon } from '../components/common/Icons';

// ─── Section Shell ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white dark:bg-slate-800 p-5 sm:p-6 shadow-xs ${
        danger
          ? 'border-rose-300 dark:border-rose-700'
          : 'border-slate-200/80 dark:border-slate-700/80'
      }`}
    >
      <div className="mb-5 pb-4 border-b border-slate-100 dark:border-slate-700">
        <h2
          className={`text-sm font-semibold ${danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Theme options ────────────────────────────────────────────────────────────

type ThemeOption = 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon size={16} /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon size={16} /> },
];

// ─── Profile Info Row ─────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="w-32 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-slate-800 dark:text-slate-200">{value ?? '—'}</span>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
    manager: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
    employee: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  };
  const cls = map[role.toLowerCase()] ?? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {role}
    </span>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  // ── Password change state ───────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    setPwdLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPwdSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleSignOut() {
    await logout();
    navigate('/login');
  }

  // Derive initials and avatar color
  const name: string = user?.name ?? 'Unknown User';
  const email: string = user?.email ?? '—';
  const department: string = (user as Record<string, string> | null)?.department ?? '—';
  const position: string = (user as Record<string, string> | null)?.position ?? '—';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarColor: string =
    (user as Record<string, string> | null)?.avatarColor ?? 'bg-indigo-600';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account preferences</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 max-w-2xl">
        {/* ── Section 1: Profile Info ───────────────────────────────────── */}
        <SectionCard title="Profile Information" subtitle="Your account details (read-only)">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${avatarColor} text-white text-lg font-bold`}
            >
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
              {role && (
                <span className="mt-1 inline-block">
                  <RoleBadge role={role} />
                </span>
              )}
            </div>
          </div>

          <div>
            <InfoRow label="Full Name" value={name} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Department" value={department} />
            <InfoRow label="Position" value={position} />
            <InfoRow label="Role" value={role ?? '—'} />
          </div>
        </SectionCard>

        {/* ── Section 2: Theme ──────────────────────────────────────────── */}
        <SectionCard title="Appearance" subtitle="Choose your preferred color theme">
          <div className="flex flex-col sm:flex-row gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Theme preference is saved locally and applied instantly.
          </p>
        </SectionCard>

        {/* ── Section 3: Security ──────────────────────────────────────── */}
        <SectionCard title="Security" subtitle="Update your account password">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
            {pwdError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-4 py-2.5 text-xs text-red-600 dark:text-red-400">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                {pwdSuccess}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={pwdLoading}
              className="self-start rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {pwdLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </SectionCard>

        {/* ── Section 4: Danger Zone ─────────────────────────────────────── */}
        <SectionCard
          title="Danger Zone"
          subtitle="Irreversible or sensitive account actions"
          danger
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Sign out of WorkSphere</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                You'll be redirected to the login page and your session will end.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
