import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { taskService } from '../../services/taskService';
import type { Employee } from '../../types/employee';
import { TasksIcon, AlertCircleIcon, CheckCircleIcon } from '../../components/common/Icons';

const PRIORITY_ENUM_MAP: Record<string, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
};

export default function AdminCreateTaskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployees() {
      setLoadingEmployees(true);
      try {
        // If director/admin, load all employees; otherwise load subordinates
        const data = await employeeService.getAll();
        setEmployees(data.filter((e) => e.isActive));
        if (data.length > 0) {
          setAssignedToId(data[0].id.toString());
        }
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : 'Failed to load employee list.');
      } finally {
        setLoadingEmployees(false);
      }
    }
    loadEmployees();
  }, []);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = 'Title is required';
    if (!description.trim()) err.description = 'Description is required';
    if (!assignedToId) err.assignedToId = 'Please select an employee';
    if (!dueDate) err.dueDate = 'Due date is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await taskService.create({
        name: title.trim(),
        description: description.trim(),
        assignedToId: parseInt(assignedToId, 10),
        dueDate: new Date(dueDate).toISOString(),
        priority: PRIORITY_ENUM_MAP[priority] ?? 1,
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/admin/tasks');
      }, 1200);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
          <TasksIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create New Task</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Assign a deliverable to an employee within your team hierarchy.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircleIcon size={18} className="text-emerald-600 shrink-0" />
          <span>Task successfully assigned and created! Redirecting to Task List...</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircleIcon size={18} className="text-rose-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Audit API Auth Middleware Security Headers"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Provide complete requirements, constraints, and acceptance criteria..."
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 resize-none transition-all ${
                errors.description
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
          </div>

          {/* Grid row: Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Assigned To */}
            <div>
              <label htmlFor="assigned-to" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Assign To <span className="text-rose-500">*</span>
              </label>
              {loadingEmployees ? (
                <div className="py-2.5 px-4 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  Loading active employees...
                </div>
              ) : (
                <select
                  id="assigned-to"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.jobTitle} ({emp.department || 'General'})
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-[11px] text-slate-400">
                {user?.isDirector ? 'All active employees (Director scope)' : 'Scoped to your managed team members'}
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Urgent' | 'High' | 'Medium' | 'Low')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Urgent">Urgent (Immediate action)</option>
                <option value="High">High (Current sprint)</option>
                <option value="Medium">Medium (Scheduled)</option>
                <option value="Low">Low (Backlog)</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-due-date" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
              }}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                errors.dueDate
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.dueDate && <p className="mt-1 text-xs text-rose-500">{errors.dueDate}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || submitted}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
