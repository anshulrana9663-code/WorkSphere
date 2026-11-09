import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { SunIcon, MoonIcon, SettingsIcon } from '../../components/common/Icons';

// ─── Inline MonitorIcon ───────────────────────────────────────────────────────
function MonitorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

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
      className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-xs ${
        danger ? 'border-rose-300' : 'border-slate-200/80'
      }`}
    >
      <div className="mb-5 pb-4 border-b border-slate-100">
        <h2
          className={`text-sm font-semibold ${danger ? 'text-rose-600' : 'text-slate-900'}`}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

type ThemeOption = 'light' | 'system' | 'dark';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <SunIcon size={16} /> },
  { value: 'system', label: 'System', icon: <MonitorIcon /> },
  { value: 'dark', label: 'Dark', icon: <MoonIcon size={16} /> },
];

function getInitialTheme(): ThemeOption {
  try {
    const stored = localStorage.getItem('ws-theme');
    if (stored === 'light' || stored === 'system' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return 'system';
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value ?? '—'}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<ThemeOption>(getInitialTheme);

  function handleThemeChange(value: ThemeOption) {
    setTheme(value);
    try {
      localStorage.setItem('ws-theme', value);
    } catch {
      // ignore
    }
  }

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  async function handleSignOut() {
    await logout();
    navigate('/login');
  }

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
        <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
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
              <p className="text-base font-semibold text-slate-900">{name}</p>
              <p className="text-sm text-slate-500">{email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-xs font-semibold">
                  Admin
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold">
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
                  onClick={() => handleThemeChange(opt.value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Appearance configuration is synchronized with your local browser storage.
          </p>
        </SectionCard>

        {/* ── Section 3: Security ────────────────────────────────────────── */}
        <SectionCard title="Admin Security" subtitle="Update administrative password credentials">
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
            {pwdError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-700">
                {pwdSuccess}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none"
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
              <p className="text-sm font-medium text-slate-800">Terminate Admin Session</p>
              <p className="text-xs text-slate-500 mt-0.5">
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
