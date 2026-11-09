export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'In Progress' | 'Completed' | 'Pending' | 'Overdue' | 'Blocked';

export interface Assigner {
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: Assigner;
  assignedTo: string;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  category: string;
  createdAt: string;
  estimatedHours?: number;
  blockedReason?: string;
}

export type SortField = 'dueDate' | 'assignedBy' | 'title' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface TaskComment {
  id: string;
  author: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  timestamp: string; // ISO string
  isCurrentUser: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;         // human-readable, e.g. "2.4 MB"
  type: string;         // mime-category label, e.g. "PDF", "Image", "Spreadsheet"
  uploadedBy: string;
  uploadedAt: string;   // ISO string
}

