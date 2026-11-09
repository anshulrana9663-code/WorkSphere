import { useState } from 'react';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkBackendHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealthStatus({ success: true, data });
      } else {
        setHealthStatus({ success: false, message: `HTTP ${response.status}: ${response.statusText}` });
      }
    } catch (err) {
      setHealthStatus({
        success: false,
        message: 'Could not reach backend API at /api/health. Ensure WorkSphere.Server is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 mb-4">
            Initial Scaffolding Completed
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to WorkSphere
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            The full-stack application architecture has been established. Frontend and backend are decoupled,
            independently runnable, and ready for future module development.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Frontend Stack</h2>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">React / Vite</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              React 19 with JSX
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              React Router DOM (Client-side routing)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              Tailwind CSS (Modern utility-first styling)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              Modular structure: components, pages, layouts, features, services, hooks, routes, utils, assets
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-semibold text-slate-800">Backend Stack</h2>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">.NET / C#</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              ASP.NET Core Web API
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              Entity Framework Core (SQL Server)
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              Application DbContext with assembly configuration
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              Organized layers: Controllers, Services, Interfaces, Repositories, DTOs, Entities, Data, Middleware, Helpers
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Backend Health Verification</h2>
        <p className="text-sm text-slate-600">
          Verify communication with the backend API health check endpoint (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">GET /api/health</code>).
        </p>
        <button
          onClick={checkBackendHealth}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer transition-colors"
        >
          {loading ? 'Checking...' : 'Check Backend Health'}
        </button>

        {healthStatus && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm border ${
              healthStatus.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {healthStatus.success ? (
              <div>
                <p className="font-semibold">Backend is online and responsive!</p>
                <pre className="mt-2 text-xs font-mono bg-white p-2 rounded border border-emerald-200 overflow-x-auto">
                  {JSON.stringify(healthStatus.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div>
                <p className="font-semibold">Backend connection notice:</p>
                <p className="mt-1 text-xs">{healthStatus.message}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

