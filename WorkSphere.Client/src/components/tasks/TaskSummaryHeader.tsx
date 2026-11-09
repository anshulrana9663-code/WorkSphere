import { TasksIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from '../common/Icons';
import type { Task } from '../../types/task';

interface TaskSummaryHeaderProps {
  tasks: Task[];
  activeStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function TaskSummaryHeader({
  tasks,
  activeStatusFilter,
  onStatusFilterChange,
}: TaskSummaryHeaderProps) {
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const overdue = tasks.filter((t) => t.status === 'Overdue').length;

  const STATS = [
    {
      id: 'all',
      label: 'All Tasks',
      count: total,
      icon: TasksIcon,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
    },
    {
      id: 'In Progress',
      label: 'In Progress',
      count: inProgress,
      icon: ClockIcon,
      color: 'text-indigo-700 bg-indigo-50/70 border-indigo-100',
      activeColor: 'bg-indigo-600 text-white border-indigo-600 shadow-sm',
    },
    {
      id: 'Completed',
      label: 'Completed',
      count: completed,
      icon: CheckCircleIcon,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      activeColor: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
    },
    {
      id: 'Pending',
      label: 'Pending',
      count: pending,
      icon: ClockIcon,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      activeColor: 'bg-amber-600 text-white border-amber-600 shadow-sm',
    },
    {
      id: 'Overdue',
      label: 'Overdue',
      count: overdue,
      icon: AlertCircleIcon,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      activeColor: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 mb-2">
            <TasksIcon size={14} />
            <span>Assigned to Alex Morgan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            My Tasks Backlog
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Track, prioritize, and manage all work items directly assigned to your profile across active workspace modules.
          </p>
        </div>

        {/* Completion Progress Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Completion Rate</div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {total > 0 ? Math.round((completed / total) * 100) : 0}%
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-600">
            ✓
          </div>
        </div>
      </div>

      {/* Summary Cards with Quick Filter capability */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {STATS.map((stat) => {
          const isActive = activeStatusFilter === stat.id;
          const Icon = stat.icon;

          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => onStatusFilterChange(stat.id)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                isActive
                  ? stat.activeColor
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="min-w-0">
                <div
                  className={`text-xs font-medium truncate ${
                    isActive ? 'text-white/80' : 'text-slate-500'
                  }`}
                >
                  {stat.label}
                </div>
                <div
                  className={`text-xl font-extrabold mt-0.5 tracking-tight ${
                    isActive ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {stat.count}
                </div>
              </div>
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isActive ? 'bg-white/20 text-white' : stat.color
                }`}
              >
                <Icon size={18} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

