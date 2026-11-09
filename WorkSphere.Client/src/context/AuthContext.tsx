import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser, AuthContextValue } from '../types/auth';
import { authService } from '../services/authService';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  const login = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // even if backend logout fails, clear local session
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        validateSession,
      }}>

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
