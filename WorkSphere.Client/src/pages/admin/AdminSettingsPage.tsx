import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { SunIcon, MoonIcon, SettingsIcon } from '../../components/common/Icons';

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

type ThemeOption = 'light' | 'dark';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon size={16} /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon size={16} /> },
];

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="w-36 shrink-0 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value ?? '—'}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
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

  const name: string = user?.name ?? 'Admin User';
  const email: string = user?.email ?? '—';
  const department: string = user?.department ?? 'Leadership';
  const position: string = user?.position ?? 'Engineering Lead';
  const isDirector: boolean = !!user?.isDirector;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avatarColor: string = user?.avatarColor ?? 'bg-emerald-600';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white shrink-0">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administrative account credentials and workspace governance
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Section 1: Profile Info ───────────────────────────────────── */}
        <SectionCard title="Admin Profile & Scope" subtitle="Administrative hierarchy and assignment privileges">
          {/* Avatar and Header */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${avatarColor} text-white text-lg font-bold shadow-xs`}
            >
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900 dark:bg-slate-700 text-white px-2.5 py-0.5 text-xs font-semibold">
                  Admin
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-2.5 py-0.5 text-xs font-semibold">
                  {isDirector ? 'Director Scope (All Employees)' : 'Manager Scope (Assigned Team)'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <InfoRow label="Full Name" value={name} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Department" value={department} />
            <InfoRow label="Leadership Role" value={position} />
            <InfoRow label="Administrative Authority" value={isDirector ? 'Organization-wide Assignment & Review' : 'Team Lead & Direct Reports'} />
          </div>
        </SectionCard>

        {/* ── Section 2: Theme ──────────────────────────────────────────── */}
        <SectionCard title="Appearance" subtitle="Select your visual workspace preference">
          <div className="flex flex-col sm:flex-row gap-3">
            {THEME_OPTIONS.map((opt) => {
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
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
            Appearance configuration is synchronized with your local browser storage.
          </p>
        </SectionCard>

        {/* ── Section 3: Security ──────────────────────────────────────── */}
        <SectionCard title="Admin Security" subtitle="Update your administrative password">
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
              className="self-start rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {pwdLoading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </SectionCard>

        {/* ── Section 4: Danger Zone ─────────────────────────────────────── */}
        <SectionCard
          title="Session & Security"
          subtitle="Sign out from administrative privileges"
          danger
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Terminate Admin Session</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Revoke current administrative token and return to authentication gateway.
              </p>
            </div>
            <button
              type="button"
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
