/**
 * Authentication Provider
 * Handles authentication state, auto-login on refresh, and route protection
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { authState, User } from '@/lib/atoms';
import { authAPI } from '@/lib/api-services';

interface LoginData {
  user: User;
  token?: string;
  success: boolean;
}

interface AuthContextType {
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
  const [, setAuth] = useRecoilState(authState);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuth(prev => ({ ...prev, isLoading: true }));
        
        // Make request to loadOnRefresh endpoint
        const response = await authAPI.loadOnRefresh();
        
        if (response.success && response.user) {
          // User is authenticated, update state
          setAuth({
            isAuthenticated: true,
            user: response.user,
            token: response.token || null,
            isLoading: false,
          });
          
          // Redirect to home if currently on auth page
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/auth/')) {
            router.push('/');
          }
        } else {
          // User is not authenticated
          setAuth({
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
        setAuth({
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
  }, [setAuth, router]);

  const login = (userData: LoginData) => {
    setAuth({
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
    setAuth({
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

  const value = {
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
