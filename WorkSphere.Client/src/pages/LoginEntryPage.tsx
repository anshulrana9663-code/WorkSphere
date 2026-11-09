import { useNavigate } from 'react-router-dom';
import { WorkSphereLogo } from '../components/common/Icons';

export default function LoginEntryPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <WorkSphereLogo size={52} />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">WorkSphere</h1>
          <p className="text-slate-500 text-sm mt-1">Employee Productivity Hub</p>
        </div>
      </div>

      {/* Two role cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee card */}
        <button
          onClick={() => navigate('/login/employee')}
          className="group flex flex-col items-start p-7 rounded-2xl border-2 border-indigo-100 bg-white hover:border-indigo-400 hover:shadow-lg transition-all text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Employee</span>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Employee Portal</h2>
          <p className="text-sm text-slate-500 mb-5">Access your tasks, track performance, and manage your workspace settings.</p>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
            Sign In as Employee
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        {/* Admin card */}
        <button
          onClick={() => navigate('/login/admin')}
          className="group flex flex-col items-start p-7 rounded-2xl border-2 border-slate-200 bg-slate-900 hover:border-slate-600 hover:shadow-lg transition-all text-left cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Admin</span>
          <h2 className="text-lg font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-sm text-slate-400 mb-5">Manage teams, assign tasks, conduct reviews, and monitor performance.</p>
          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-slate-300 group-hover:gap-3 transition-all">
            Sign In as Admin
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>

      <p className="mt-10 text-xs text-slate-400">© 2026 WorkSphere Hub · Enterprise Productivity</p>
    </div>
  );
}
