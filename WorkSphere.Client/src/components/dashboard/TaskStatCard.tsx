import type { ComponentType, SVGProps } from 'react';
import { ArrowUpRightIcon } from '../common/Icons';

type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string; size?: number }>;

interface TaskStatCardProps {
  title: string;
  count: number | string;
  subtitle: string;
  icon: IconType;
  variant: 'primary' | 'success' | 'warning' | 'danger';
  trend?: string;
  progressPercent?: number;
}

const VARIANT_CONFIG = {
  primary: {
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    bar: 'bg-indigo-600',
    glow: 'group-hover:border-indigo-300',
  },
  success: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-500',
    glow: 'group-hover:border-emerald-300',
  },
  warning: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-100',
    iconBg: 'bg-amber-600 text-white',
    badge: 'text-amber-700 bg-amber-50 border-amber-200',
    bar: 'bg-amber-500',
    glow: 'group-hover:border-amber-300',
  },
  danger: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-100',
    iconBg: 'bg-rose-600 text-white',
    badge: 'text-rose-700 bg-rose-50 border-rose-200',
    bar: 'bg-rose-500',
    glow: 'group-hover:border-rose-300',
  },
};

export function TaskStatCard({
  title,
  count,
  subtitle,
  icon: Icon,
  variant,
  trend,
  progressPercent,
}: TaskStatCardProps) {
  const styles = VARIANT_CONFIG[variant];

  return (
    <div
      className={`group relative rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs transition-all duration-200 hover:shadow-md ${styles.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {count}
          </p>
        </div>

        <div className={`p-3 rounded-xl shadow-xs ${styles.iconBg} shrink-0`}>
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
        <span className="truncate">{subtitle}</span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold border ${styles.badge}`}>
            <span>{trend}</span>
            <ArrowUpRightIcon size={12} />
          </span>
        )}
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
}

