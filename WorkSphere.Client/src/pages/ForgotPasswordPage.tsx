import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkSphereLogo } from '../components/common/Icons';
import { authService } from '../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Sign In
        </Link>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <WorkSphereLogo size={44} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email address and we'll send you a password reset link or token.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            <p>{message}</p>
            {resetToken && (
              <div className="mt-3 p-3 bg-white/90 border border-emerald-300 rounded-lg text-xs break-all">
                <span className="font-semibold block text-slate-700 mb-1">Development Reset Token:</span>
                <code className="text-indigo-600 select-all">{resetToken}</code>
                <div className="mt-2">
                  <Link
                    to={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`}
                    className="font-semibold text-indigo-600 underline hover:text-indigo-800"
                  >
                    Click here to reset your password now &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

