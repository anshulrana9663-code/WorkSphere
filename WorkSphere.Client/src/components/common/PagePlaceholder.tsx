import type { ComponentType, SVGProps } from 'react';

interface PagePlaceholderProps {
  title: string;
  category: 'Workspace' | 'Management';
  description: string;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { className?: string; size?: number }>;
}

export function PagePlaceholder({
  title,
  category,
  description,
  icon: Icon,
}: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                <Icon size={28} />
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 mb-2">
                {category}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Workspace Card */}
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
        <div className="mx-auto max-w-md space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            {Icon ? <Icon size={24} /> : (
              <span className="text-lg font-bold">W</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {title} Module Ready
          </h3>
          <p className="text-sm text-slate-500">
            This module workspace is structured and connected to the navigation shell. Specific view components and workflows can be mounted here.
          </p>
        </div>
      </div>
    </div>
  );
}

