import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { WorkSphereLogo } from '../components/common/Icons';
import { authService } from '../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !token.trim() || !newPassword.trim()) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <WorkSphereLogo size={44} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a secure password for your account.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 text-sm text-emerald-700 text-center">
            <p className="font-semibold text-base mb-1">Password Reset Successful!</p>
            <p>Your password has been updated. Redirecting to login...</p>
            <Link to="/login" className="mt-3 inline-block font-semibold text-indigo-600 underline">
              Go to Login now &rarr;
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="token" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Reset Token
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

