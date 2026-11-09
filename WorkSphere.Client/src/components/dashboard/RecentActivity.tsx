import { ActivityIcon, CheckCircleIcon, TasksIcon } from '../common/Icons';

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
    bg: string;
  };
  action: string;
  target: string;
  category: string;
  timeAgo: string;
  type: 'completed' | 'created' | 'comment' | 'meeting';
}

const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    user: { name: 'Sarah Connor', initials: 'SC', bg: 'bg-emerald-600' },
    action: 'marked as completed',
    target: 'Tailwind CSS Layout & Responsive Shell',
    category: 'WorkSphere Core',
    timeAgo: '14m ago',
    type: 'completed',
  },
  {
    id: 'a2',
    user: { name: 'David Kim', initials: 'DK', bg: 'bg-indigo-600' },
    action: 'created a new task',
    target: 'Entity Framework Core Database Migration',
    category: 'Backend API',
    timeAgo: '42m ago',
    type: 'created',
  },
  {
    id: 'a3',
    user: { name: 'Elena Rostova', initials: 'ER', bg: 'bg-rose-500' },
    action: 'scheduled meeting',
    target: 'Weekly Architecture Review Sync',
    category: 'Management',
    timeAgo: '2h ago',
    type: 'meeting',
  },
  {
    id: 'a4',
    user: { name: 'Alex Morgan', initials: 'AM', bg: 'bg-violet-600' },
    action: 'updated status of',
    target: 'Sprint 3 Team Objectives & Key Results',
    category: 'Product Ops',
    timeAgo: '4h ago',
    type: 'comment',
  },
];

export function RecentActivity({ activities }: { activities?: ActivityItem[] } = {}) {
  const items = activities && activities.length > 0 ? activities : SAMPLE_ACTIVITIES;

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <ActivityIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-500">
                Live team updates across modules
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Realtime
          </span>
        </div>

        {/* Activity Timeline List */}
        <div className="space-y-4">
          {items.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${activity.user.bg}`}
              >
                {activity.user.initials}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">
                    {activity.user.name}
                  </span>{' '}
                  <span className="text-slate-500">{activity.action}</span>{' '}
                  <span className="font-medium text-indigo-700">
                    &ldquo;{activity.target}&rdquo;
                  </span>
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                    {activity.type === 'completed' ? (
                      <CheckCircleIcon size={12} className="text-emerald-500" />
                    ) : (
                      <TasksIcon size={12} className="text-indigo-500" />
                    )}
                    {activity.category}
                  </span>
                  <span>&bull;</span>
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 text-center">
        <button
          type="button"
          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          View Activity Audit Log &rarr;
        </button>
      </div>
    </div>
  );
}

