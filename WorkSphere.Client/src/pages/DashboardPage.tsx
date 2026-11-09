import { useState } from 'react';
import Dashboard from './Dashboard';
import { ChevronDownIcon } from '../components/common/Icons';

export default function DashboardPage() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    success: boolean;
    data?: unknown;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkBackendHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus({ success: true, data });
      } else {
        setHealthStatus({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
        });
      }
    } catch {
      setHealthStatus({
        success: false,
        message: 'Could not reach backend API at /api/health. Ensure WorkSphere.Server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Primary Dashboard Views */}
      <Dashboard />

      {/* Developer Diagnostics Collapsible Drawer */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            System &amp; Backend Connectivity Diagnostics
          </span>
          <ChevronDownIcon
            size={16}
            className={`transition-transform duration-200 ${
              showDiagnostics ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showDiagnostics && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <p className="text-xs text-slate-500">
              Verify communication with the backend API health check endpoint (
              <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">
                GET /api/health
              </code>
              ).
            </p>

            <button
              onClick={checkBackendHealth}
              disabled={loading}
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {loading ? 'Checking...' : 'Check Backend Health'}
            </button>

            {healthStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs border ${
                  healthStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {healthStatus.success ? (
                  <div>
                    <p className="font-semibold">Backend is online and responsive</p>
                    <pre className="mt-1.5 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-emerald-200 overflow-x-auto">
                      {JSON.stringify(healthStatus.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">Backend connection notice</p>
                    <p className="mt-1">{healthStatus.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
