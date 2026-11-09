import { apiFetch } from './api';
import type {
  ApiTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  CreateCommentRequest,
  ApiTaskComment,
  ApiTaskAttachment,
} from '../types/apiTask';

export const taskService = {
  async getAll(): Promise<ApiTask[]> {
    return apiFetch<ApiTask[]>('/api/tasks');
  },

  async getById(id: number): Promise<ApiTask> {
    return apiFetch<ApiTask>(`/api/tasks/${id}`);
  },

  async create(data: CreateTaskRequest): Promise<ApiTask> {
    return apiFetch<ApiTask>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateTaskRequest): Promise<ApiTask> {
    return apiFetch<ApiTask>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: number, data: UpdateTaskStatusRequest): Promise<{ success: boolean; status: string; updatedDate: string }> {
    return apiFetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async addComment(taskId: number, content: string): Promise<ApiTaskComment> {
    return apiFetch<ApiTaskComment>(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  async updateComment(taskId: number, commentId: number, content: string): Promise<ApiTaskComment> {
    return apiFetch<ApiTaskComment>(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  async deleteComment(taskId: number, commentId: number): Promise<{ success: boolean }> {
    return apiFetch(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  async uploadAttachment(taskId: number, file: File): Promise<ApiTaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<ApiTaskAttachment>(`/api/tasks/${taskId}/attachments`, {
      method: 'POST',
      body: formData,
    });
  },

  async deleteAttachment(taskId: number, attachmentId: number): Promise<{ success: boolean }> {
    return apiFetch(`/api/tasks/${taskId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  },
};

