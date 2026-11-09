export interface Employee {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle: string;
  department?: string;
  managerId?: number;
  managerName?: string;
  isActive: boolean;
  hireDate: string; // ISO date string
  salary?: number;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle: string;
  department?: string;
  managerId?: number;
  hireDate: string;
  salary?: number;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle: string;
  department?: string;
  managerId?: number;
  hireDate: string;
  salary?: number;
}

