/**
 * API Service Functions
 * Centralized API calls for all application features
 */

import api from './api';
import { User, Doctor, Department, Appointment, AppointmentDtoForAdminDashboard, UsersAppointmentsDto } from './types';
import type { DoctorRegisterFormData, AdminUserFormData } from './validations';

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

  // Complete registration (accepts backend UserRegistrationDto shape)
  completeRegistration: async (userData: Record<string, unknown>) => {
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
  const response = await api.post('/user/logout');
    return response.data;
  },

  // Load user on refresh
  loadOnRefresh: async () => {
    try {
      const response = await api.get('/user/loadOnRefresh');
      if (response.status !== 200) {
        const error = new Error('Not authenticated') as Error & { status?: number };
        error.status = response.status;
        throw error;
      }
      return response.data;
    } catch (err: unknown) {
      // If error is axios error, check for response status
      const maybeAxios = err as { response?: { status?: number } };
      if (maybeAxios?.response && maybeAxios.response.status !== 200) {
        const error = new Error('Not authenticated') as Error & { status?: number };
        error.status = maybeAxios.response.status;
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

  // Update user by id using backend endpoint /user//updateUser/{id}
  updateUserById: async (id: string, payload: Record<string, unknown>) => {
    const response = await api.put(`/user/updateUser/${id}`, payload);
    return response.data;
  },

  // Delete user by id (assumes backend endpoint /user/deleteUser/{id})
  deleteUserById: async (id: string) => {
    const response = await api.delete(`/user/deleteUser/${id}`);
    return response.data;
  },
};

// Doctor APIs
export const doctorAPI = {
  // Get all doctors (mapped from backend DTO to our Doctor type)
  getAllDoctors: async (): Promise<Doctor[]> => {
    type BackendDoctor = {
      id: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      username?: string;
      email?: string;
      phoneNumber?: string;
      gender?: string;
      specialization?: string; // e.g., "Cardiology" or "Cardiologist"
      experienceYears?: number;
      qualification?: string; // comma-separated or single string
      licenseNumber?: string;
  hospitalName?: string;
  doctorAddress?: string;
      availableTimeFrom?: string; // HH:mm
      availableTimeTo?: string;   // HH:mm
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      rating?: number;
      reviewCount?: number;
      isPresent?: boolean;
      createdAt?: string;
      lastModified?: string;
    };
    

  const response = await api.get<BackendDoctor[]>('/doctor/getAllDoctors');

    const toSlots = (from?: string, to?: string): string[] | undefined => {
      if (!from || !to) return undefined;
      // Provide two representative times so UI can show "Available: f, t"
      return [from, to];
    };

    const doctors: Doctor[] = (response.data || []).map((d) => {
      const name = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      const qualification = d.qualification
        ? d.qualification.split(',').map((q) => q.trim()).filter(Boolean)
        : undefined;
      return {
        id: d.id,
        name: name || d.username || 'Doctor',
        email: d.email,
        phone: d.phoneNumber,
        specialization: d.specialization,
        experience: d.experienceYears ?? 0,
        qualification,
        rating: typeof d.rating === 'number' ? d.rating : 0,
        reviewCount: d.reviewCount ?? 0,
  location: d.hospitalName || d.city || d.doctorAddress,
        availableSlots: toSlots(d.availableTimeFrom, d.availableTimeTo),
        isAvailable: d.isPresent,
        createdAt: d.createdAt,
        updatedAt: d.lastModified,
      } as Doctor;
    });

    return doctors;
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
    // Legacy generic endpoint (kept for compatibility)
    const response = await api.post('/doctors', doctorData);
    return response.data;
  },

  // Register doctor via Admin (uses DoctorRegisterDto shape on backend)
  registerDoctor: async (payload: DoctorRegisterFormData) => {
  // Use provided backend endpoint for doctor registration
  const response = await api.post('/doctor/register', payload);
    return response.data;
  },

  // Update doctor (Admin only)
  updateDoctor: async (id: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data;
  },

  // Admin update using admin endpoint (partial DTO accepted by backend)
  adminUpdateDoctor: async (id: string, payload: Partial<DoctorRegisterFormData>) => {
    const response = await api.put(`/admin/doctors/${id}`, payload);
    return response.data;
  },

  // Delete doctor (Admin only)
  deleteDoctor: async (id: string) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  // Admin delete using admin endpoint
  adminDeleteDoctor: async (id: string) => {
    const response = await api.delete(`/admin/doctors/${id}`);
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

// Admin Users APIs
export const adminUserAPI = {
  list: async (): Promise<User[]> => {
    type BackendUserDto = {
      fullName?: string;
      email?: string;
      username?: string;
      id: string;
      roles?: Array<string> | Set<string>;
      phoneNumber?: string;
    };
    const response = await api.get<BackendUserDto[]>('/user/getAllUsers');
    const arr = Array.isArray(response.data) ? response.data : [];
    const normalizeRoles = (rolesIn?: Array<string> | Set<string>): Array<'patient' | 'doctor' | 'admin'> => {
      const list = Array.isArray(rolesIn) ? rolesIn : rolesIn ? Array.from(rolesIn) : [];
      const norm = list
        .map((r) => String(r).toLowerCase())
        .map((r) => (r === 'user' ? 'patient' : r))
        .filter((r) => r === 'patient' || r === 'doctor' || r === 'admin') as Array<'patient' | 'doctor' | 'admin'>;
      return Array.from(new Set(norm));
    };
    const pickPrimary = (roles: Array<'patient' | 'doctor' | 'admin'>): User['role'] => {
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('doctor')) return 'doctor';
      return 'patient';
    };
    const users: User[] = arr.map((u) => ({
      id: u.id,
      email: u.email || '',
      name: u.fullName || u.username || 'User',
      roles: normalizeRoles(u.roles),
      role: pickPrimary(normalizeRoles(u.roles)),
      phone: u.phoneNumber,
      contactNumber: u.phoneNumber,
    }));
    return users;
  },
  create: async (payload: AdminUserFormData): Promise<User> => {
    const response = await api.post('/admin/users', payload);
    return response.data;
  },
  update: async (id: string, payload: Partial<AdminUserFormData>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, payload);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
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

  // Book appointment using backend-provided DTO at /appointment/book
  bookAppointmentV2: async (payload: {
    appointmentTime: string; // ISO local datetime string e.g. 2025-09-04T10:30:00
    userId: string;
    usersFullName: string;
    usersEmail: string;
    doctorId: string;
    reason: string;
  }) => {
    const response = await api.post('/appointment/book', payload);
    return response.data;
  },

  // Get only the logged-in user's appointments with doctor info from backend DTO
  getAppointmentsForUser: async (userId: string): Promise<UsersAppointmentsDto[]> => {
    const response = await api.get<UsersAppointmentsDto[]>(`/appointment/getUserAppointments/${userId}`);
    const arr = Array.isArray(response.data) ? response.data : [];
    // Ensure minimal normalization (strings)
    return arr.map(a => ({
      appointmentId: String(a.appointmentId),
      appointmentStatus: String(a.appointmentStatus || ''),
      doctorId: String(a.doctorId || ''),
      doctorsFullName: String(a.doctorsFullName || ''),
      doctorSpecialization: a.doctorSpecialization ? String(a.doctorSpecialization) : undefined,
      appointmentTime: String(a.appointmentTime as unknown as string),
      reason: a.reason ? String(a.reason) : undefined,
    }));
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

// Admin Appointments Dashboard API (backend-provided route)
export const adminAppointmentAPI = {
  // Returns a list of appointments suitable for admin dashboard metrics
  getAllForDashboard: async (): Promise<AppointmentDtoForAdminDashboard[]> => {
    const response = await api.get<AppointmentDtoForAdminDashboard[]>('/appointment/getAllAppointments');
    const arr = Array.isArray(response.data) ? response.data : [];
    return arr;
  },
};
