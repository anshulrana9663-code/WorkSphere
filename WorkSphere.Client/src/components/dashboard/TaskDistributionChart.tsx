import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export interface WeeklyTaskData {
  day: string;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface TaskDistributionChartProps {
  statusCounts?: {
    completed: number;
    inProgress: number;
    pending: number;
  };
  weeklyData?: WeeklyTaskData[];
}

const DEFAULT_WEEKLY_DATA: WeeklyTaskData[] = [
  { day: 'Mon', completed: 4, inProgress: 2, pending: 1 },
  { day: 'Tue', completed: 6, inProgress: 3, pending: 2 },
  { day: 'Wed', completed: 8, inProgress: 4, pending: 1 },
  { day: 'Thu', completed: 5, inProgress: 5, pending: 3 },
  { day: 'Fri', completed: 9, inProgress: 3, pending: 1 },
  { day: 'Sat', completed: 3, inProgress: 1, pending: 0 },
  { day: 'Sun', completed: 2, inProgress: 1, pending: 1 },
];

const DEFAULT_STATUS_DISTRIBUTION = [
  { name: 'Completed', value: 37, color: '#10B981', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
  { name: 'In Progress', value: 19, color: '#6366F1', textColor: 'text-indigo-700', bg: 'bg-indigo-50' },
  { name: 'Pending', value: 9, color: '#F59E0B', textColor: 'text-amber-700', bg: 'bg-amber-50' },
];

export function TaskDistributionChart({ statusCounts, weeklyData }: TaskDistributionChartProps = {}) {
  const [chartView, setChartView] = useState<'bar' | 'donut'>('bar');

  const distribution = useMemo(() => {
    if (statusCounts) {
      return [
        { name: 'Completed', value: statusCounts.completed, color: '#10B981', textColor: 'text-emerald-700', bg: 'bg-emerald-50' },
        { name: 'In Progress', value: statusCounts.inProgress, color: '#6366F1', textColor: 'text-indigo-700', bg: 'bg-indigo-50' },
        { name: 'Pending', value: statusCounts.pending, color: '#F59E0B', textColor: 'text-amber-700', bg: 'bg-amber-50' },
      ];
    }
    return DEFAULT_STATUS_DISTRIBUTION;
  }, [statusCounts]);

  const chartWeeklyData = weeklyData ?? DEFAULT_WEEKLY_DATA;
  const totalTasks = distribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Task Progress & Distribution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Visual comparison of Completed vs Pending vs In Progress tasks
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartView('bar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartView === 'bar'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Bar Chart
          </button>
          <button
            type="button"
            onClick={() => setChartView('donut')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              chartView === 'donut'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Donut
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {distribution.map((item) => {
          const percent = totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0;
          return (
            <div
              key={item.name}
              className={`p-3.5 rounded-xl border border-slate-100 flex items-center justify-between ${item.bg}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {item.value}
                </span>
                <span className="text-[11px] text-slate-500 ml-1">
                  ({percent}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Canvas Area */}
      <div className="h-72 w-full pt-2">
        {chartView === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartWeeklyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar
                name="Completed"
                dataKey="completed"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Bar
                name="In Progress"
                dataKey="inProgress"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
              <Bar
                name="Pending"
                dataKey="pending"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {distribution.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

