import { useState, useEffect, type FormEvent } from 'react';
import { taskService } from '../../services/taskService';
import type { Employee } from '../../types/employee';
import { TasksIcon, CloseIcon, AlertCircleIcon, CheckCircleIcon } from '../common/Icons';

const PRIORITY_ENUM_MAP: Record<string, number> = {
  Low: 0,
  Medium: 1,
  High: 2,
  Urgent: 3,
};

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  subordinates: Employee[];
}

export function CreateTaskDialog({
  isOpen,
  onClose,
  onTaskCreated,
  subordinates,
}: CreateTaskDialogProps) {
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
    if (subordinates.length > 0 && !assignedToId) {
      setAssignedToId(subordinates[0].id.toString());
    }
  }, [subordinates, assignedToId]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      if (subordinates.length > 0) {
        setAssignedToId(subordinates[0].id.toString());
      }
      setPriority('Medium');
      setDueDate('');
      setErrors({});
      setApiError(null);
      setSubmitted(false);
    }
  }, [isOpen, subordinates]);

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = 'Title is required';
    if (!description.trim()) err.description = 'Description is required';
    if (!assignedToId) err.assignedToId = 'Please select a direct report';
    if (!dueDate) err.dueDate = 'Due date is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
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
        onTaskCreated();
        onClose();
      }, 900);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to create and assign task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <TasksIcon size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assign New Deliverable</h2>
              <p className="text-xs text-slate-500">Create and assign a task to your direct reports</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircleIcon size={16} className="text-emerald-600 shrink-0" />
              <span>Deliverable successfully assigned and recorded!</span>
            </div>
          )}

          {apiError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
              <AlertCircleIcon size={16} className="text-rose-600 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="modal-task-title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="modal-task-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                placeholder="e.g. Implement API rate limiter middleware"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="modal-task-desc" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="modal-task-desc"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                }}
                placeholder="Provide requirements, deliverables, and acceptance criteria..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 resize-none transition-all ${
                  errors.description
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
            </div>

            {/* Grid: Assignee & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assigned To (Subordinates) */}
              <div>
                <label htmlFor="modal-task-assignee" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assign To <span className="text-rose-500">*</span>
                </label>
                <select
                  id="modal-task-assignee"
                  value={assignedToId}
                  onChange={(e) => {
                    setAssignedToId(e.target.value);
                    if (errors.assignedToId) setErrors((prev) => ({ ...prev, assignedToId: '' }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {subordinates.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.jobTitle}
                    </option>
                  ))}
                </select>
                {errors.assignedToId && <p className="mt-1 text-xs text-rose-500">{errors.assignedToId}</p>}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="modal-task-priority" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Priority
                </label>
                <select
                  id="modal-task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'Urgent' | 'High' | 'Medium' | 'Low')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Urgent">Urgent (Immediate)</option>
                  <option value="High">High (Current sprint)</option>
                  <option value="Medium">Medium (Scheduled)</option>
                  <option value="Low">Low (Backlog)</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="modal-task-due" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="modal-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.dueDate
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
              />
              {errors.dueDate && <p className="mt-1 text-xs text-rose-500">{errors.dueDate}</p>}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-task-form"
            disabled={submitting || submitted}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {submitting ? 'Creating...' : 'Assign Deliverable'}
          </button>
        </div>
      </div>
    </div>
  );
}

