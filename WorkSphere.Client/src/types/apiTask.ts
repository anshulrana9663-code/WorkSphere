// API-level Task types (matches server DTOs) — distinct from legacy mock Task type
export type ApiTaskStatus = 'Pending' | 'InProgress' | 'InReview' | 'Completed' | 'Cancelled';
export type ApiTaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ApiTaskComment {
  id: number;
  content: string;
  employeeId: number;
  employeeName: string;
  createdDate: string;
  updatedDate?: string;
}

export interface ApiTaskAttachment {
  id: number;
  name: string;
  fileName: string;
  size: number;
  contentType: string;
  employeeId?: number;
  uploadedByName?: string;
  uploadedDate: string;
}

export interface ApiTask {
  id: number;
  name: string;
  description?: string;
  assignedById?: number;
  assignedByName?: string;
  assignedToId?: number;
  assignedToName?: string;
  dueDate?: string;
  createdDate: string;
  updatedDate?: string;
  status: string; // string because server sends enum as string name
  priority: string;
  commentsCount: number;
  attachmentsCount: number;
  comments: ApiTaskComment[];
  attachments: ApiTaskAttachment[];
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  assignedToId: number;
  dueDate?: string;
  priority: number; // enum value: Low=0, Medium=1, High=2, Urgent=3
}

export interface UpdateTaskRequest {
  name: string;
  description?: string;
  assignedToId: number;
  dueDate?: string;
  priority: number;
}

export interface UpdateTaskStatusRequest {
  status: number; // Pending=0, InProgress=1, InReview=2, Completed=3, Cancelled=4
}

