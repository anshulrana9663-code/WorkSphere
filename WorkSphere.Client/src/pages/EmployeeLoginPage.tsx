import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { WorkSphereLogo } from '../components/common/Icons';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function EmployeeLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.user.role !== 'Employee') {
        setError('Access denied: This portal is for employees. Please use the Admin login.');
        await authService.logout();
        return;
      }
      login(res.user);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      {/* Back link */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to role selection
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <WorkSphereLogo size={44} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Employee Portal
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your employee credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 pr-11 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing In…
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Switch role link */}
      <p className="mt-6 text-sm text-slate-500">
        Admin?{' '}
        <Link to="/login/admin" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
