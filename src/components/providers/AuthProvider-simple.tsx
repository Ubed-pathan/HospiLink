/**
 * Authentication Context
 * Simple React Context-based authentication state management
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api-services';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'admin';
  contactNumber?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

// Login data interface
interface LoginData {
  user: User;
  token?: string;
  success: boolean;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (userData: LoginData) => void;
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

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        // For now, skip the loadOnRefresh call since backend might not be ready
        // You can enable this when your backend /loadOnRefresh endpoint is ready
        // const response = await authAPI.loadOnRefresh();
        
        // Check if user has a token in localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
          // If token exists, assume user is authenticated
          // In production, you'd validate the token with the backend
          setAuthState({
            isAuthenticated: true,
            user: null, // Will be populated when backend is connected
            token: token,
            isLoading: false,
          });
          
          // Redirect to home if currently on auth page
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/auth/')) {
            router.push('/');
          }
        } else {
          // User is not authenticated
          setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          
          // Redirect to signin if not on auth page
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth/')) {
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, assume not authenticated
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
        
        // Redirect to signin
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth/')) {
          router.push('/auth/signin');
        }
      } finally {
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [router]);

  const login = (userData: LoginData) => {
    setAuthState({
      isAuthenticated: true,
      user: userData.user,
      token: userData.token || null,
      isLoading: false,
    });
    
    // Store token in localStorage if provided
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
    }
    
    // Redirect to home
    router.push('/');
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear auth state
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    
    // Redirect to signin
    router.push('/auth/signin');
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    isInitialized,
  };

  // Show loading while checking authentication
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
