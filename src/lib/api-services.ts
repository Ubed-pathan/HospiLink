/**
 * API Service Functions
 * Centralized API calls for all application features
 */

import api from './api';
import { User, Doctor, Department, Appointment } from './types';

// Authentication APIs
export const authAPI = {
  // Google OAuth signin
  googleSignin: async (googleToken: string) => {
    const response = await api.post('/auth/google-signin', { token: googleToken });
    return response.data;
  },

  // Send OTP for registration
  sendOTP: async (email: string) => {
    const response = await api.post('/user/send-otp', { email });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string) => {
    const response = await api.post('/user/verify-otp', { email, otp });
    return response.data;
  },

  // Complete registration
  completeRegistration: async (userData: Partial<User> & { password: string }) => {
    const response = await api.post('/user/register', userData);
    return response.data;
  },

  // Regular signin (backend expects LoginDto { username, password })
  signin: async (username: string, password: string) => {
    const response = await api.post('/user/login', { username, password }, { withCredentials: true });
    return response.data;
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Load user on refresh
  loadOnRefresh: async () => {
    try {
      const response = await api.get('/user/loadOnRefresh');
      if (response.status !== 200) {
        const error = new Error('Not authenticated');
        // @ts-ignore
        error.status = response.status;
        throw error;
      }
      return response.data;
    } catch (err: any) {
      // If error is axios error, check for response status
      if (err.response && err.response.status !== 200) {
        const error = new Error('Not authenticated');
        // @ts-ignore
        error.status = err.response.status;
        throw error;
      }
      throw err;
    }
  },
};

// User Profile APIs
export const userAPI = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/user/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/user/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Doctor APIs
export const doctorAPI = {
  // Get all doctors
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/doctors');
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  // Search doctors
  searchDoctors: async (filters: {
    specialty?: string;
    searchTerm?: string;
    availability?: string;
    rating?: number;
  }): Promise<Doctor[]> => {
    const response = await api.get('/doctors/search', { params: filters });
    return response.data;
  },

  // Add doctor (Admin only)
  addDoctor: async (doctorData: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  // Update doctor (Admin only)
  updateDoctor: async (id: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  // Delete doctor (Admin only)
  deleteDoctor: async (id: string) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  // Get doctor availability
  getDoctorAvailability: async (doctorId: string, date: string) => {
    const response = await api.get(`/doctors/${doctorId}/availability`, {
      params: { date },
    });
    return response.data;
  },
};

// Department APIs
export const departmentAPI = {
  // Get all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await api.get('/departments');
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Add department (Admin only)
  addDepartment: async (departmentData: Omit<Department, 'id'>): Promise<Department> => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Update department (Admin only)
  updateDepartment: async (id: string, departmentData: Partial<Department>): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  },

  // Delete department (Admin only)
  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },
};

// Appointment APIs
export const appointmentAPI = {
  // Get user appointments
  getUserAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/my-appointments');
    return response.data;
  },

  // Get all appointments (Admin only)
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Book appointment
  bookAppointment: async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id: string) => {
    const response = await api.put(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (id: string, newDate: string, newTimeSlot: string): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}/reschedule`, {
      date: newDate,
      timeSlot: newTimeSlot,
    });
    return response.data;
  },

  // Update appointment status (Admin only)
  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
  },
};

// Dashboard APIs (Admin only)
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // Get monthly appointment trends
  getMonthlyTrends: async (year: number) => {
    const response = await api.get('/dashboard/trends', { params: { year } });
    return response.data;
  },

  // Get popular doctors
  getPopularDoctors: async (limit: number = 5) => {
    const response = await api.get('/dashboard/popular-doctors', { params: { limit } });
    return response.data;
  },

  // Get recent appointments
  getRecentAppointments: async (limit: number = 10) => {
    const response = await api.get('/dashboard/recent-appointments', { params: { limit } });
    return response.data;
  },
};

// Reviews and Ratings APIs
export const reviewAPI = {
  // Get doctor reviews
  getDoctorReviews: async (doctorId: string) => {
    const response = await api.get(`/reviews/doctor/${doctorId}`);
    return response.data;
  },

  // Add review
  addReview: async (reviewData: {
    doctorId: string;
    rating: number;
    comment: string;
    appointmentId: string;
  }) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId: string, reviewData: { rating: number; comment: string }) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
