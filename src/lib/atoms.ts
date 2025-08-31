/**
 * Recoil Atoms for Global State Management
 * Manages authentication, user session, theme, and application state
 */

import { atom } from 'recoil';

// User and Authentication State
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  contactNumber?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export const authState = atom<AuthState>({
  key: 'authState',
  default: {
    isAuthenticated: false,
    user: null,
    token: null,
  isLoading: true,
  },
});

// Theme State
export const themeState = atom<'light' | 'dark'>({
  key: 'themeState',
  default: 'light',
});

// Loading States
export const globalLoadingState = atom<boolean>({
  key: 'globalLoadingState',
  default: false,
});

// Notification State
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export const notificationsState = atom<Notification[]>({
  key: 'notificationsState',
  default: [],
});

// Appointment Related State
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  contactNumber: string;
  experience: number;
  rating: number;
  totalReviews: number;
  profileImage?: string;
  availability: {
    day: string;
    timeSlots: string[];
  }[];
  consultationFee: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  doctors: string[]; // Doctor IDs
  icon?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const doctorsState = atom<Doctor[]>({
  key: 'doctorsState',
  default: [],
});

export const departmentsState = atom<Department[]>({
  key: 'departmentsState',
  default: [],
});

export const appointmentsState = atom<Appointment[]>({
  key: 'appointmentsState',
  default: [],
});

// Filter and Search State
export interface DoctorFilters {
  specialty: string;
  availability: string;
  rating: number;
  searchTerm: string;
}

export const doctorFiltersState = atom<DoctorFilters>({
  key: 'doctorFiltersState',
  default: {
    specialty: '',
    availability: '',
    rating: 0,
    searchTerm: '',
  },
});

// Admin Dashboard State
export interface DashboardStats {
  totalAppointments: number;
  todayAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  monthlyAppointments: number[];
  popularDoctors: Doctor[];
  recentAppointments: Appointment[];
}

export const dashboardStatsState = atom<DashboardStats>({
  key: 'dashboardStatsState',
  default: {
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalDepartments: 0,
    monthlyAppointments: [],
    popularDoctors: [],
    recentAppointments: [],
  },
});

// Mobile Navigation State
export const mobileMenuState = atom<boolean>({
  key: 'mobileMenuState',
  default: false,
});

// Admin Sidebar State
export const adminSidebarState = atom<boolean>({
  key: 'adminSidebarState',
  default: true,
});

// Form State for Multi-step Registration
export interface RegistrationFormData {
  email: string;
  otp: string;
  name: string;
  password: string;
  confirmPassword: string;
  contactNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
}

export const registrationFormState = atom<Partial<RegistrationFormData>>({
  key: 'registrationFormState',
  default: {},
});

export const registrationStepState = atom<number>({
  key: 'registrationStepState',
  default: 1,
});
