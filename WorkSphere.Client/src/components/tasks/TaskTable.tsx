import { useState, useMemo } from 'react';
import type { Task, SortField, SortDirection } from '../../types/task';
import {
  SearchIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../common/Icons';
import { TaskDetailDialog } from './TaskDetailDialog';

interface TaskTableProps {
  tasks: Task[];
  statusFilter: string;
}

const PAGE_SIZE = 20;

const PRIORITY_BADGE: Record<string, string> = {
  Urgent: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  High: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  Medium: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_BADGE: Record<string, string> = {
  'In Progress': 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  Completed: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Overdue: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  Blocked: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
};

const STATUS_DOT: Record<string, string> = {
  'In Progress': 'bg-indigo-500',
  Completed: 'bg-emerald-500',
  Pending: 'bg-amber-500',
  Overdue: 'bg-rose-500',
  Blocked: 'bg-purple-500',
};

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function SortButton({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField | null;
  sortDir: SortDirection;
  onSort: (f: SortField) => void;
}) {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 group cursor-pointer hover:text-slate-900 transition-colors"
    >
      <span>{label}</span>
      {isActive ? (
        sortDir === 'asc' ? (
          <ArrowUpIcon size={13} className="text-indigo-600" />
        ) : (
          <ArrowDownIcon size={13} className="text-indigo-600" />
        )
      ) : (
        <ArrowUpDownIcon size={13} className="text-slate-300 group-hover:text-slate-500" />
      )}
    </button>
  );
}

export function TaskTable({ tasks, statusFilter }: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField | null>('dueDate');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filtering by status (from header) + search
  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, statusFilter, search]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal = '';
      let bVal = '';
      if (sortField === 'dueDate') {
        aVal = a.dueDate;
        bVal = b.dueDate;
      } else if (sortField === 'assignedBy') {
        aVal = a.assignedBy.name;
        bVal = b.assignedBy.name;
      }
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sorted, currentPage],
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, sorted.length);

  return (
    <>
      {/* Search + Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <SearchIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search tasks by name…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 shrink-0">
          {sorted.length === 0
            ? 'No tasks found'
            : `Showing ${startIndex}–${endIndex} of ${sorted.length} task${sorted.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-xs">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3.5 text-left w-[35%]">Task</th>
              <th className="px-4 py-3.5 text-left">
                <SortButton
                  field="assignedBy"
                  label="Assigned By"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3.5 text-left">Priority</th>
              <th className="px-4 py-3.5 text-left">
                <SortButton
                  field="dueDate"
                  label="Due Date"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th className="px-4 py-3.5 text-left">Status</th>
              <th className="px-4 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-400">
                  <div className="space-y-1.5">
                    <p className="text-base font-semibold text-slate-500">No tasks match your filters</p>
                    <p className="text-sm">Try adjusting the search or status filter above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((task) => (
                <tr
                  key={task.id}
                  className="bg-white hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTask(task)}
                >
                  {/* Task Name */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug line-clamp-2">
                        {task.title}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{task.id}</span>
                    </div>
                  </td>

                  {/* Assigned By */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${task.assignedBy.avatarColor}`}
                      >
                        {task.assignedBy.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {task.assignedBy.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{task.assignedBy.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE['Low']}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-4">
                    <span
                      className={`text-xs font-medium ${task.status === 'Overdue' ? 'text-rose-600 font-semibold' : 'text-slate-600'}`}
                    >
                      {formatShortDate(task.dueDate)}
                    </span>
                    {task.status === 'Overdue' && (
                      <p className="text-[10px] text-rose-500 mt-0.5">Overdue</p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[task.status] ?? STATUS_BADGE['Pending']}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status] ?? STATUS_DOT['Pending']}`}
                      />
                      {task.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                      }}
                      aria-label={`View details for ${task.title}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <EyeIcon size={13} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5 px-1">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeftIcon size={16} />
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === p
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Task Detail Dialog */}
      <TaskDetailDialog task={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}

