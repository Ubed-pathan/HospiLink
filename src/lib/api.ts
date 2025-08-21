/**
 * API Configuration and Interceptors
 * Centralized API management using Axios with request/response interceptors
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration
// API base URL: prefer env var, fall back to local backend default for dev convenience
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1115';
declare global {
  interface Window { __HOSPILINK_API_URL_WARNED__?: boolean }
}
if (!process.env.NEXT_PUBLIC_API_URL && typeof window !== 'undefined' && !window.__HOSPILINK_API_URL_WARNED__) {
  console.warn('NEXT_PUBLIC_API_URL not set. Falling back to http://localhost:1115. Define it in .env.local to silence this warning.');
  window.__HOSPILINK_API_URL_WARNED__ = true;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or session storage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
