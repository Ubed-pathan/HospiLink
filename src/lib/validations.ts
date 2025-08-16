/**
 * Form Validation Schemas using Zod
 * Centralized validation schemas for all forms in the application
 */

import { z } from 'zod';

// Authentication Schemas
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

export const signinSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registrationSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Please enter a valid date of birth'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
  }),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile Update Schema
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    }, 'Please enter a valid date of birth'),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Gender is required',
  }),
  address: z
    .string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters'),
});

// Password Change Schema
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

// Appointment Booking Schema
export const appointmentBookingSchema = z.object({
  doctorId: z
    .string()
    .min(1, 'Please select a doctor'),
  departmentId: z
    .string()
    .min(1, 'Please select a department'),
  date: z
    .string()
    .min(1, 'Please select a date')
    .refine((date) => {
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    }, 'Appointment date cannot be in the past'),
  timeSlot: z
    .string()
    .min(1, 'Please select a time slot'),
  reason: z
    .string()
    .min(1, 'Please provide a reason for the appointment')
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
});

// Doctor Management Schemas (Admin)
export const doctorSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  specialty: z
    .string()
    .min(1, 'Specialty is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  experience: z
    .number()
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience must be less than 50 years'),
  consultationFee: z
    .number()
    .min(0, 'Consultation fee cannot be negative')
    .max(10000, 'Consultation fee must be reasonable'),
  availability: z.array(z.object({
    day: z.string(),
    timeSlots: z.array(z.string()),
  })).min(1, 'At least one day of availability is required'),
});

// Department Management Schema (Admin)
export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  icon: z
    .string()
    .optional(),
});

// Review Schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating cannot be more than 5'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
});

// Search and Filter Schemas
export const doctorSearchSchema = z.object({
  searchTerm: z.string().optional(),
  specialty: z.string().optional(),
  availability: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  sortBy: z.enum(['name', 'rating', 'experience', 'consultationFee']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

// Export TypeScript types derived from schemas
export type EmailFormData = z.infer<typeof emailSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type AppointmentBookingFormData = z.infer<typeof appointmentBookingSchema>;
export type DoctorFormData = z.infer<typeof doctorSchema>;
export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type DoctorSearchFormData = z.infer<typeof doctorSearchSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
