import { apiFetch } from './api';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  EmployeePerformanceSummary,
} from '../types/review';

export const reviewService = {
  async getAll(revieweeId?: number): Promise<Review[]> {
    const url = revieweeId ? `/api/reviews?revieweeId=${revieweeId}` : '/api/reviews';
    return apiFetch<Review[]>(url);
  },

  async getById(id: number): Promise<Review> {
    return apiFetch<Review>(`/api/reviews/${id}`);
  },

  async getEmployeePerformance(employeeId: number): Promise<EmployeePerformanceSummary> {
    return apiFetch<EmployeePerformanceSummary>(`/api/reviews/performance/${employeeId}`);
  },

  async create(data: CreateReviewRequest): Promise<Review> {
    return apiFetch<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateReviewRequest): Promise<Review> {
    return apiFetch<Review>(`/api/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return apiFetch(`/api/reviews/${id}`, {
      method: 'DELETE',
    });
  },
};

