import { apiFetch } from './api';
import type { AuthUser } from '../types/auth';

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}

export interface GenericResponse {
  success: boolean;
  message: string;
}

export interface CreateEmployeeAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  jobTitle: string;
  department?: string;
  hireDate: string;
  salary?: number;
  managerId: number;
}

export interface CreateEmployeeAccountResponse extends GenericResponse {
  user: AuthUser;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout(): Promise<GenericResponse> {
    return apiFetch<GenericResponse>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser(): Promise<AuthUser> {
    return apiFetch<AuthUser>('/api/auth/me');
  },

  async createEmployeeAccount(data: CreateEmployeeAccountRequest): Promise<CreateEmployeeAccountResponse> {
    return apiFetch<CreateEmployeeAccountResponse>('/api/auth/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return apiFetch<ForgotPasswordResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, token: string, newPassword: string): Promise<GenericResponse> {
    return apiFetch<GenericResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<GenericResponse> {
    return apiFetch<GenericResponse>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

