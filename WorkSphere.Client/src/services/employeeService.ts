import { apiFetch } from './api';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '../types/employee';

export const employeeService = {
  async getAll(): Promise<Employee[]> {
    return apiFetch<Employee[]>('/api/employees');
  },

  async getById(id: number): Promise<Employee> {
    return apiFetch<Employee>(`/api/employees/${id}`);
  },

  async getSubordinates(): Promise<Employee[]> {
    return apiFetch<Employee[]>('/api/employees/subordinates');
  },

  async create(data: CreateEmployeeRequest): Promise<Employee> {
    return apiFetch<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    return apiFetch<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async toggleActive(id: number, isActive: boolean): Promise<{ success: boolean; id: number; isActive: boolean }> {
    return apiFetch(`/api/employees/${id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  async deactivate(id: number): Promise<{ success: boolean; message: string }> {
    return apiFetch(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  },
};

