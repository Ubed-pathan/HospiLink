
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/auth/')) {
      setIsInitialized(true);
      return;
    }
    const checkAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        const response = await authAPI.loadOnRefresh();
        if (response && response.id && response.username) {
          setAuthState({
            isAuthenticated: true,
            user: {
              id: response.id,
              email: response.email,
              name: response.fullName,
              username: response.username,
            },
            token: null,
            isLoading: false,
          });
          if (currentPath.startsWith('/auth/')) {
            router.push('/');
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          router.push('/auth/signin');
        }
      } catch {
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
        router.push('/auth/signin');
      } finally {
        setIsInitialized(true);
      }
    };
    checkAuth();
  }, [router]);

  const login = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user,
      token: null,
      isLoading: false,
    });
    router.push('/');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
  } catch {
      // ignore
    }
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    router.push('/auth/signin');
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    isInitialized,
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HospiLink...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
