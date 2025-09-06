/**
 * TypeScript type definitions for the application
 */

export interface User {
  id: string;
  email: string;
  name: string;
  contactNumber?: string;
  phone?: string;
  roles?: Array<'patient' | 'doctor' | 'admin'>;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  role: 'patient' | 'doctor' | 'admin';
  createdAt?: string;
  updatedAt?: string;
  profileImage?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  specialization?: string;
  department?: string;
  departmentId?: string;
  qualification?: string[];
  education?: string;
  experience: number; // years
  bio?: string;
  rating: number;
  reviewCount?: number;
  location?: string;
  consultationFee?: number;
  availableSlots?: string[];
  availability?: {
    day: string;
    slots: string[];
  }[];
  languages?: string[];
  image?: string;
  profileImage?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  image?: string;
  specialties?: string[];
  doctors?: string[];
  doctorCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  department?: string;
  departmentId?: string;
  date: string;
  time?: string;
  timeSlot?: string;
  duration?: number; // minutes
  type?: 'consultation' | 'follow-up' | 'emergency' | 'routine-checkup' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'pending';
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  amount?: number;
  consultationFee?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'system' | 'promotion';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: string;
  labResults?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  appointmentId?: string;
}

export interface PaymentRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  currency: string;
  method: 'credit-card' | 'debit-card' | 'insurance' | 'cash' | 'bank-transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

// UI State interfaces
export interface FilterState {
  searchTerm: string;
  department: string;
  location: string;
  availability: string;
  rating: number;
  priceRange: [number, number];
}

export interface AppointmentFilters {
  status: string;
  dateRange: [string, string];
  doctorId: string;
  departmentId: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  totalRevenue: number;
  appointmentsToday: number;
  availableDoctors: number;
  averageRating: number;
  completionRate: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'appointment' | 'break' | 'meeting' | 'blocked';
  doctorId?: string;
  patientId?: string;
  appointmentId?: string;
  color?: string;
}

// Form interfaces
export interface AppointmentFormData {
  doctorId: string;
  departmentId: string;
  date: string;
  time: string;
  type: string;
  symptoms: string;
  notes?: string;
}

export interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  departmentId: string;
  qualification: string[];
  experience: number;
  bio: string;
  location: string;
  consultationFee: number;
  languages: string[];
  availableSlots: string[];
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

// Backend DTOs
// Lightweight appointment DTO used by Admin Dashboard endpoint
export interface AppointmentDtoForAdminDashboard {
  id?: string;
  appointmentId?: string;
  doctorId?: string;
  patientId?: string;
  departmentId?: string;
  // ISO date-time string, e.g., "2025-01-31T10:30:00Z"
  appointmentTime?: string;
  // Some backends may use this alternate name
  appointmentDateTime?: string;
  // Backend may send various casings/enums; keep it flexible here
  status?: string;
  AppointmentStatus?: string;
  appointmentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  // Enriched fields provided for admin dashboard list
  usersFullName?: string;
  usersEmail?: string;
  doctorsFullName?: string;
  doctorsEmail?: string;
  reason?: string;
}

// Backend Users Appointments DTO for a user's own appointments
export interface UsersAppointmentsDto {
  appointmentId: string;
  appointmentStatus: string;
  doctorId: string;
  doctorsFullName: string;
  doctorSpecialization?: string;
  // ISO local or UTC string (LocalDateTime on backend). Treat as string.
  appointmentTime: string;
  reason?: string;
}
