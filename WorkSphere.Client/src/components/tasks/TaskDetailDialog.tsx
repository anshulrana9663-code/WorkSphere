import { useEffect, useRef, useState } from 'react';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import type { Task, TaskComment, TaskAttachment } from '../../types/task';
import {
  CloseIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TasksIcon,
  CalendarIcon,
  PaperclipIcon,
  SendIcon,
  TrashIcon,
} from '../common/Icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TaskDetailDialogProps {
  task: Task | null;
  onClose: () => void;
}

type DialogTab = 'details' | 'attachments' | 'comments';

// ---------------------------------------------------------------------------
// Style maps (unchanged from original)
// ---------------------------------------------------------------------------
const PRIORITY_STYLES: Record<string, string> = {
  Urgent: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  High: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  Medium: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const STATUS_STYLES: Record<string, { badge: string; icon: typeof ClockIcon; label: string }> = {
  'In Progress': { badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200', icon: ClockIcon, label: 'In Progress' },
  Completed:    { badge: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', icon: CheckCircleIcon, label: 'Completed' },
  Pending:      { badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200', icon: ClockIcon, label: 'Pending' },
  Overdue:      { badge: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200', icon: AlertCircleIcon, label: 'Overdue' },
  Blocked:      { badge: 'bg-purple-100 text-purple-700 ring-1 ring-purple-200', icon: AlertCircleIcon, label: 'Blocked' },
};

// ---------------------------------------------------------------------------
// Attachment file-type colours
// ---------------------------------------------------------------------------
const FILE_TYPE_STYLES: Record<string, { dot: string; badge: string }> = {
  PDF:         { dot: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
  Image:       { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Spreadsheet: { dot: 'bg-emerald-600', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Document:    { dot: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  Archive:     { dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  Other:       { dot: 'bg-slate-400',  badge: 'bg-slate-100 text-slate-600 ring-slate-200' },
};

// ---------------------------------------------------------------------------
// Dummy seed data (per-task key so each task feels independent)
// ---------------------------------------------------------------------------
const SEED_COMMENTS: TaskComment[] = [
  {
    id: 'c1',
    author: 'Sarah Connor',
    authorInitials: 'SC',
    authorColor: 'bg-emerald-600',
    text: 'Hey Alex, please make sure to include mobile viewport tests in the acceptance criteria for this one.',
    timestamp: '2026-10-28T09:14:00Z',
    isCurrentUser: false,
  },
  {
    id: 'c2',
    author: 'Alex Morgan',
    authorInitials: 'AM',
    authorColor: 'bg-indigo-600',
    text: "Got it! I'll cover both iOS and Android breakpoints and add a Storybook story for reference.",
    timestamp: '2026-10-28T09:47:00Z',
    isCurrentUser: true,
  },
  {
    id: 'c3',
    author: 'David Kim',
    authorInitials: 'DK',
    authorColor: 'bg-indigo-600',
    text: 'Left a note in the PR — consider caching the query result for at least 60 s to reduce round-trips.',
    timestamp: '2026-10-29T11:22:00Z',
    isCurrentUser: false,
  },
];

const SEED_ATTACHMENTS: TaskAttachment[] = [
  { id: 'a1', name: 'Design-Specs-v3.pdf',        size: '1.8 MB', type: 'PDF',         uploadedBy: 'Marcus Chen',   uploadedAt: '2026-10-28T08:00:00Z' },
  { id: 'a2', name: 'Wireframes-Mobile.fig',       size: '4.2 MB', type: 'Document',    uploadedBy: 'Marcus Chen',   uploadedAt: '2026-10-29T10:30:00Z' },
  { id: 'a3', name: 'Screenshot-overflow-bug.png', size: '320 KB', type: 'Image',       uploadedBy: 'Alex Morgan',   uploadedAt: '2026-10-31T14:05:00Z' },
  { id: 'a4', name: 'Task-estimates-Q4.xlsx',      size: '88 KB',  type: 'Spreadsheet', uploadedBy: 'Rachel Green',  uploadedAt: '2026-11-01T09:00:00Z' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatRelativeTime(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Tab button (Details / Attachments / Comments) */
function TabButton({
  active, label, count, onClick,
}: {
  active: boolean; label: string; count?: number; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
        active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
            active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-600" />
      )}
    </button>
  );
}

/** ── DETAILS TAB (exact original content, no changes) ── */
function DetailsTab({ task }: { task: Task }) {
  const statusConfig = STATUS_STYLES[task.status] ?? STATUS_STYLES['Pending'];
  const StatusIcon = statusConfig.icon;
  const priorityStyle = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES['Low'];
  const isOverdue = task.status === 'Overdue';
  const dueDateFormatted = formatDate(task.dueDate);
  const createdAtFormatted = formatDate(task.createdAt);

  return (
    <div className="space-y-6">
      {/* Status + Priority Row */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
          <StatusIcon size={12} />
          {statusConfig.label}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityStyle}`}>
          {task.priority} Priority
        </span>
      </div>

      {/* Description */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Description
        </h3>
        <p className="text-sm text-slate-700 leading-relaxed">{task.description}</p>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Assigned By */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Assigned By</p>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${task.assignedBy.avatarColor}`}>
              {task.assignedBy.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{task.assignedBy.name}</p>
              <p className="text-xs text-slate-500 truncate">{task.assignedBy.role}</p>
              <p className="text-xs text-indigo-600 truncate">{task.assignedBy.email}</p>
            </div>
          </div>
        </div>

        {/* Assigned To */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Assigned To</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              AM
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{task.assignedTo}</p>
              <p className="text-xs text-slate-500">You</p>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className={`p-4 rounded-xl border ${isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200/70'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
            Due Date
          </p>
          <div className="flex items-center gap-2">
            <CalendarIcon size={15} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
            <p className={`text-sm font-semibold ${isOverdue ? 'text-rose-700' : 'text-slate-900'}`}>
              {dueDateFormatted}
            </p>
          </div>
          {isOverdue && (
            <p className="text-xs text-rose-600 mt-1 font-medium">⚠ This task is overdue</p>
          )}
        </div>

        {/* Created At */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Created On</p>
          <div className="flex items-center gap-2">
            <ClockIcon size={15} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-900">{createdAtFormatted}</p>
          </div>
        </div>
      </div>

      {/* Estimated Hours */}
      {task.estimatedHours !== undefined && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
          <ClockIcon size={15} className="text-indigo-500" />
          <span className="text-sm text-indigo-700 font-medium">
            Estimated effort: <strong>{task.estimatedHours} hours</strong>
          </span>
        </div>
      )}
    </div>
  );
}

/** ── ATTACHMENTS TAB ── */
function AttachmentsTab({
  attachments,
  onAdd,
  onRemove,
}: {
  attachments: TaskAttachment[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onAdd(file);
      // Reset so the same file can be re-selected
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          <PaperclipIcon size={13} />
          Add Attachment
        </button>
        {/* Hidden native file input */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload attachment"
        />
      </div>

      {/* Attachment list */}
      {attachments.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-slate-200">
          <PaperclipIcon size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-500">No attachments yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Click "Add Attachment" to upload files.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => {
            const typeStyle = FILE_TYPE_STYLES[att.type] ?? FILE_TYPE_STYLES['Other'];
            return (
              <li
                key={att.id}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors group"
              >
                {/* File-type dot */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeStyle.badge} ring-1`}>
                  <PaperclipIcon size={14} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{att.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {att.size} · uploaded by {att.uploadedBy} · {formatRelativeTime(att.uploadedAt)}
                  </p>
                </div>

                {/* Type badge */}
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ring-1 ${typeStyle.badge}`}>
                  {att.type}
                </span>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => onRemove(att.id)}
                  aria-label={`Remove ${att.name}`}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                >
                  <TrashIcon size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** ── COMMENTS TAB ── */
function CommentsTab({
  comments,
  onAdd,
  onRemove,
}: {
  comments: TaskComment[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setDraft('');
    // Scroll to bottom after paint
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Ctrl/Cmd + Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thread */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-500">No comments yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Be the first to leave a comment.</p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`flex gap-3 group ${c.isCurrentUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${c.authorColor}`}
              >
                {c.authorInitials}
              </div>

              {/* Bubble */}
              <div className={`flex-1 min-w-0 ${c.isCurrentUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`flex items-center gap-2 ${c.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-semibold text-slate-700">{c.author}</span>
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(c.timestamp)}</span>
                </div>
                <div
                  className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                    c.isCurrentUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  {c.text}

                  {/* Delete — only on current user's messages */}
                  {c.isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => onRemove(c.id)}
                      aria-label="Delete comment"
                      className="absolute -top-2 -left-2 p-1 rounded-full bg-white border border-slate-200 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                    >
                      <TrashIcon size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
        <textarea
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment… (Ctrl+Enter to send)"
          className="w-full px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 select-none">Ctrl+Enter to send</p>
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          >
            <SendIcon size={12} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dialog
// ---------------------------------------------------------------------------
export function TaskDetailDialog({ task, onClose }: TaskDetailDialogProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DialogTab>('details');
  const [comments, setComments] = useState<TaskComment[]>(SEED_COMMENTS);
  const [attachments, setAttachments] = useState<TaskAttachment[]>(SEED_ATTACHMENTS);
  const [currentStatus, setCurrentStatus] = useState<string>(task?.status ?? 'Pending');
  const [blockedReason, setBlockedReason] = useState<string>(task?.blockedReason ?? '');
  const [isBlocking, setIsBlocking] = useState<boolean>(false);
  const [blockInput, setBlockInput] = useState<string>('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const rawId = task ? parseInt(task.id.replace('WS-', ''), 10) : NaN;

  // Load real comments & attachments if valid rawId
  useEffect(() => {
    if (!task) return;
    setActiveTab('details');
    setCurrentStatus(task.status);
    setBlockedReason(task.blockedReason ?? '');
    setIsBlocking(false);
    setBlockInput('');
    setStatusError(null);

    if (!isNaN(rawId)) {
      taskService.getById(rawId).then((apiTask) => {
        if (apiTask.comments) {
          setComments(
            apiTask.comments.map((c) => ({
              id: c.id.toString(),
              author: c.employeeName,
              authorInitials: c.employeeName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase(),
              authorColor: 'bg-indigo-600',
              text: c.content,
              timestamp: c.createdDate,
              isCurrentUser: user?.name === c.employeeName,
            }))
          );
        }
        if (apiTask.attachments) {
          setAttachments(
            apiTask.attachments.map((a) => {
              const sizeKB = a.size / 1024;
              const sizeMB = sizeKB / 1024;
              const sizeLabel =
                sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
              const ext = a.fileName.split('.').pop()?.toLowerCase() ?? '';
              const typeMap: Record<string, string> = {
                pdf: 'PDF',
                png: 'Image',
                jpg: 'Image',
                jpeg: 'Image',
                gif: 'Image',
                webp: 'Image',
                xlsx: 'Spreadsheet',
                xls: 'Spreadsheet',
                csv: 'Spreadsheet',
                doc: 'Document',
                docx: 'Document',
                txt: 'Document',
                fig: 'Document',
                zip: 'Archive',
                rar: 'Archive',
                gz: 'Archive',
              };
              return {
                id: a.id.toString(),
                name: a.fileName,
                size: sizeLabel,
                type: typeMap[ext] ?? 'Other',
                uploadedBy: a.uploadedByName || 'Team Member',
                uploadedAt: a.uploadedDate,
              };
            })
          );
        }
      }).catch(() => {
        // Fallback to seeds if network/task not found in server
        setComments(SEED_COMMENTS);
        setAttachments(SEED_ATTACHMENTS);
      });
    } else {
      setComments(SEED_COMMENTS);
      setAttachments(SEED_ATTACHMENTS);
    }
  }, [task?.id]);

  // Close on Escape
  useEffect(() => {
    if (!task) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [task, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = task ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [task]);

  if (!task) return null;

  // ── Comment handlers ──
  async function handleAddComment(text: string) {
    if (!isNaN(rawId)) {
      try {
        const added = await taskService.addComment(rawId, text);
        const newComment: TaskComment = {
          id: added.id.toString(),
          author: added.employeeName || user?.name || 'You',
          authorInitials: (added.employeeName || user?.name || 'WS')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          authorColor: 'bg-indigo-600',
          text: added.content,
          timestamp: added.createdDate,
          isCurrentUser: true,
        };
        setComments((prev) => [...prev, newComment]);
        return;
      } catch (err) {
        console.error('Failed to add comment via API', err);
      }
    }
    const fallbackComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: user?.name || 'You',
      authorInitials: user?.initials || 'ME',
      authorColor: 'bg-indigo-600',
      text,
      timestamp: new Date().toISOString(),
      isCurrentUser: true,
    };
    setComments((prev) => [...prev, fallbackComment]);
  }

  async function handleRemoveComment(id: string) {
    const commentId = parseInt(id, 10);
    if (!isNaN(rawId) && !isNaN(commentId)) {
      try {
        await taskService.deleteComment(rawId, commentId);
      } catch (err) {
        console.error('Failed to delete comment via API', err);
      }
    }
    setComments((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Attachment handlers ──
  async function handleAddAttachment(file: File) {
    if (!isNaN(rawId)) {
      try {
        const added = await taskService.uploadAttachment(rawId, file);
        const sizeKB = added.size / 1024;
        const sizeMB = sizeKB / 1024;
        const sizeLabel =
          sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
        const ext = added.fileName.split('.').pop()?.toLowerCase() ?? '';
        const typeMap: Record<string, string> = {
          pdf: 'PDF',
          png: 'Image',
          jpg: 'Image',
          jpeg: 'Image',
          gif: 'Image',
          webp: 'Image',
          xlsx: 'Spreadsheet',
          xls: 'Spreadsheet',
          csv: 'Spreadsheet',
          doc: 'Document',
          docx: 'Document',
          txt: 'Document',
          fig: 'Document',
          zip: 'Archive',
          rar: 'Archive',
          gz: 'Archive',
        };
        const newAtt: TaskAttachment = {
          id: added.id.toString(),
          name: added.fileName,
          size: sizeLabel,
          type: typeMap[ext] ?? 'Other',
          uploadedBy: added.uploadedByName || user?.name || 'You',
          uploadedAt: added.uploadedDate,
        };
        setAttachments((prev) => [...prev, newAtt]);
        return;
      } catch (err) {
        console.error('Failed to upload attachment via API', err);
      }
    }

    const sizeKB = file.size / 1024;
    const sizeMB = sizeKB / 1024;
    const sizeLabel = sizeMB >= 1 ? `${sizeMB.toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const typeMap: Record<string, string> = {
      pdf: 'PDF', png: 'Image', jpg: 'Image', jpeg: 'Image', gif: 'Image', webp: 'Image',
      xlsx: 'Spreadsheet', xls: 'Spreadsheet', csv: 'Spreadsheet',
      doc: 'Document', docx: 'Document', txt: 'Document', fig: 'Document',
      zip: 'Archive', rar: 'Archive', gz: 'Archive',
    };
    const newAtt: TaskAttachment = {
      id: `a-${Date.now()}`,
      name: file.name,
      size: sizeLabel,
      type: typeMap[ext] ?? 'Other',
      uploadedBy: user?.name || 'You',
      uploadedAt: new Date().toISOString(),
    };
    setAttachments((prev) => [...prev, newAtt]);
  }

  async function handleRemoveAttachment(id: string) {
    const attId = parseInt(id, 10);
    if (!isNaN(rawId) && !isNaN(attId)) {
      try {
        await taskService.deleteAttachment(rawId, attId);
      } catch (err) {
        console.error('Failed to delete attachment via API', err);
      }
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleStatusChangeAction(newStatus: string) {
    setStatusError(null);
    setCurrentStatus(newStatus);
    if (!isNaN(rawId)) {
      let code = 0;
      if (newStatus === 'In Progress') code = 1;
      else if (newStatus === 'Completed') code = 3;
      else if (newStatus === 'Blocked') code = 4;
      try {
        await taskService.updateStatus(rawId, { status: code });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update status.';
        setStatusError(msg);
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Task details: ${task.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — wider to accommodate the comment section */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col">

        {/* ── Dialog Header ── */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <TasksIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-mono font-semibold text-slate-400">{task.id}</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {task.category}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {task.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-6 px-6 mt-4 border-b border-slate-100 shrink-0">
          <TabButton active={activeTab === 'details'}     label="Details"     onClick={() => setActiveTab('details')} />
          <TabButton active={activeTab === 'attachments'} label="Attachments" count={attachments.length} onClick={() => setActiveTab('attachments')} />
          <TabButton active={activeTab === 'comments'}    label="Comments"    count={comments.length}    onClick={() => setActiveTab('comments')} />
        </div>

        {/* ── Tab Content (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'details' && <DetailsTab task={task} />}

          {activeTab === 'attachments' && (
            <AttachmentsTab
              attachments={attachments}
              onAdd={handleAddAttachment}
              onRemove={handleRemoveAttachment}
            />
          )}

          {activeTab === 'comments' && (
            <CommentsTab
              comments={comments}
              onAdd={handleAddComment}
              onRemove={handleRemoveComment}
            />
          )}
        </div>

        {/* ── Dialog Footer with Status Updates ── */}
        {statusError && (
          <div className="px-6 py-2.5 bg-rose-50 border-t border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
            <span>{statusError}</span>
            <button onClick={() => setStatusError(null)} className="text-rose-600 hover:text-rose-800">✕</button>
          </div>
        )}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {currentStatus}
            </span>
            {blockedReason && (
              <span className="text-xs text-purple-700 italic truncate max-w-xs" title={blockedReason}>
                (Blocked: {blockedReason})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isBlocking ? (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="text"
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  placeholder="Reason for blocker..."
                  className="px-3 py-1.5 text-xs rounded-lg border border-purple-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  disabled={!blockInput.trim()}
                  onClick={() => {
                    handleStatusChangeAction('Blocked');
                    setBlockedReason(blockInput.trim());
                    setIsBlocking(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  Save Blocker
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlocking(false)}
                  className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChangeAction('In Progress');
                    setBlockedReason('');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentStatus === 'In Progress'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  In Progress
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleStatusChangeAction('Completed');
                    setBlockedReason('');
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentStatus === 'Completed'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={() => setIsBlocking(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    currentStatus === 'Blocked'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  Blocked
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer ml-1"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
