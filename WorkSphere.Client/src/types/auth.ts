export type UserRole = 'Employee' | 'Admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatarColor: string;
  initials: string;
  isDirector: boolean;
  managerId: string | null;
  directorId: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
}
