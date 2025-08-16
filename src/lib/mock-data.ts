/**
 * Mock Data for Development and Demo
 * Simulates backend data for testing and demonstration purposes
 */

import { Doctor, Department, Appointment, User } from './atoms';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'patient',
    contactNumber: '+1234567890',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    address: '123 Main St, City, State 12345',
  },
  {
    id: '2',
    email: 'admin@hospilink.com',
    name: 'Admin User',
    role: 'admin',
    contactNumber: '+1234567891',
  },
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system care',
    doctors: ['1', '2'],
    icon: 'Heart',
  },
  {
    id: '2',
    name: 'Neurology',
    description: 'Brain and nervous system specialists',
    doctors: ['3'],
    icon: 'Brain',
  },
  {
    id: '3',
    name: 'Orthopedics',
    description: 'Bone, joint, and muscle care',
    doctors: ['4', '5'],
    icon: 'Bone',
  },
  {
    id: '4',
    name: 'Pediatrics',
    description: 'Child healthcare specialists',
    doctors: ['6'],
    icon: 'Baby',
  },
  {
    id: '5',
    name: 'Dermatology',
    description: 'Skin, hair, and nail care',
    doctors: ['7'],
    icon: 'Skin',
  },
  {
    id: '6',
    name: 'General Medicine',
    description: 'General health and wellness care',
    doctors: ['8', '9'],
    icon: 'Stethoscope',
  },
];

// Mock Doctors
export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    email: 'sarah.johnson@hospilink.com',
    contactNumber: '+1234567892',
    experience: 15,
    rating: 4.8,
    totalReviews: 245,
    consultationFee: 150,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['09:00', '10:00', '11:00', '14:00'],
      },
    ],
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    email: 'michael.chen@hospilink.com',
    contactNumber: '+1234567893',
    experience: 12,
    rating: 4.7,
    totalReviews: 189,
    consultationFee: 140,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['10:00', '11:00', '15:00', '16:00', '17:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['09:00', '10:00', '15:00', '16:00', '17:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['10:00', '11:00', '15:00', '16:00'],
      },
    ],
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Neurology',
    email: 'emily.rodriguez@hospilink.com',
    contactNumber: '+1234567894',
    experience: 18,
    rating: 4.9,
    totalReviews: 312,
    consultationFee: 180,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['08:00', '09:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['08:00', '09:00', '10:00'],
      },
    ],
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedics',
    email: 'james.wilson@hospilink.com',
    contactNumber: '+1234567895',
    experience: 20,
    rating: 4.6,
    totalReviews: 278,
    consultationFee: 160,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['09:00', '10:00', '15:00', '16:00', '17:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['09:00', '10:00', '11:00'],
      },
    ],
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Orthopedics',
    email: 'lisa.thompson@hospilink.com',
    contactNumber: '+1234567896',
    experience: 14,
    rating: 4.7,
    totalReviews: 156,
    consultationFee: 145,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['10:00', '11:00', '14:00'],
      },
    ],
  },
  {
    id: '6',
    name: 'Dr. David Kim',
    specialty: 'Pediatrics',
    email: 'david.kim@hospilink.com',
    contactNumber: '+1234567897',
    experience: 16,
    rating: 4.8,
    totalReviews: 203,
    consultationFee: 135,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['08:00', '09:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00'],
      },
    ],
  },
  {
    id: '7',
    name: 'Dr. Maria Garcia',
    specialty: 'Dermatology',
    email: 'maria.garcia@hospilink.com',
    contactNumber: '+1234567898',
    experience: 11,
    rating: 4.6,
    totalReviews: 134,
    consultationFee: 130,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['09:00', '10:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['09:00', '10:00', '11:00'],
      },
    ],
  },
  {
    id: '8',
    name: 'Dr. Robert Brown',
    specialty: 'General Medicine',
    email: 'robert.brown@hospilink.com',
    contactNumber: '+1234567899',
    experience: 22,
    rating: 4.5,
    totalReviews: 298,
    consultationFee: 120,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00'],
      },
    ],
  },
  {
    id: '9',
    name: 'Dr. Jennifer Lee',
    specialty: 'General Medicine',
    email: 'jennifer.lee@hospilink.com',
    contactNumber: '+1234567800',
    experience: 9,
    rating: 4.4,
    totalReviews: 87,
    consultationFee: 110,
    availability: [
      {
        day: 'Monday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
      },
      {
        day: 'Tuesday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00'],
      },
      {
        day: 'Wednesday',
        timeSlots: ['09:00', '10:00', '15:00', '16:00'],
      },
      {
        day: 'Thursday',
        timeSlots: ['09:00', '10:00', '11:00', '15:00'],
      },
      {
        day: 'Friday',
        timeSlots: ['09:00', '10:00', '11:00'],
      },
    ],
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    departmentId: '1',
    date: '2024-12-20',
    timeSlot: '10:00',
    status: 'scheduled',
    reason: 'Regular checkup',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
  {
    id: '2',
    patientId: '1',
    doctorId: '3',
    departmentId: '2',
    date: '2024-12-18',
    timeSlot: '14:00',
    status: 'completed',
    reason: 'Headache consultation',
    notes: 'Patient reported improvement after medication',
    createdAt: '2024-12-10T14:00:00Z',
    updatedAt: '2024-12-18T14:30:00Z',
  },
  {
    id: '3',
    patientId: '1',
    doctorId: '4',
    departmentId: '3',
    date: '2024-12-25',
    timeSlot: '15:00',
    status: 'scheduled',
    reason: 'Knee pain evaluation',
    createdAt: '2024-12-16T09:00:00Z',
    updatedAt: '2024-12-16T09:00:00Z',
  },
];

// Mock Dashboard Statistics
export const mockDashboardStats = {
  totalAppointments: 1247,
  todayAppointments: 23,
  totalPatients: 856,
  totalDoctors: 9,
  totalDepartments: 6,
  monthlyAppointments: [89, 95, 108, 112, 98, 105, 118, 124, 116, 132, 128, 135],
  popularDoctors: mockDoctors.slice(0, 5),
  recentAppointments: mockAppointments,
};

// Mock Reviews
export const mockReviews = [
  {
    id: '1',
    doctorId: '1',
    patientId: '1',
    patientName: 'John Doe',
    rating: 5,
    comment: 'Excellent doctor! Very professional and caring.',
    appointmentId: '2',
    createdAt: '2024-12-19T10:00:00Z',
  },
  {
    id: '2',
    doctorId: '3',
    patientId: '1',
    patientName: 'John Doe',
    rating: 5,
    comment: 'Dr. Rodriguez is amazing. She explained everything clearly and helped me understand my condition.',
    appointmentId: '2',
    createdAt: '2024-12-18T15:00:00Z',
  },
];

// Hospital Information
export const hospitalInfo = {
  name: 'HospiLink Medical Center',
  description: 'Leading healthcare provider committed to delivering exceptional medical care with compassion and excellence.',
  address: '123 Medical Plaza, Healthcare District, City 12345',
  phone: '+1 (555) 123-4567',
  email: 'info@hospilink.com',
  emergencyPhone: '+1 (555) 911-0000',
  establishedYear: 1985,
  beds: 250,
  accreditations: ['Joint Commission', 'ISO 9001', 'NABH'],
  mission: 'To provide world-class healthcare services that enhance the quality of life for our patients and communities.',
  vision: 'To be the leading healthcare provider recognized for clinical excellence, innovation, and compassionate care.',
  values: ['Excellence', 'Compassion', 'Integrity', 'Innovation', 'Collaboration'],
};

// Time slots for appointments
export const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Export all mock data
export const mockData = {
  users: mockUsers,
  doctors: mockDoctors,
  departments: mockDepartments,
  appointments: mockAppointments,
  dashboardStats: mockDashboardStats,
  reviews: mockReviews,
  hospitalInfo,
  timeSlots,
};
