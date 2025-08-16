/**
 * Mock data for development and testing
 */

import { Doctor, Department, Appointment, User, Notification, Review } from './types';

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system care',
    icon: 'Heart',
    color: '#EF4444',
    doctorCount: 8,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Neurology',
    description: 'Brain and nervous system disorders',
    icon: 'Brain',
    color: '#8B5CF6',
    doctorCount: 6,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Orthopedics',
    description: 'Bone, joint, and muscle treatment',
    icon: 'Bone',
    color: '#10B981',
    doctorCount: 10,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Pediatrics',
    description: 'Medical care for infants, children, and adolescents',
    icon: 'Baby',
    color: '#F59E0B',
    doctorCount: 7,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Dermatology',
    description: 'Skin, hair, and nail conditions',
    icon: 'Skin',
    color: '#EC4899',
    doctorCount: 5,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Emergency Medicine',
    description: '24/7 emergency and urgent care',
    icon: 'Ambulance',
    color: '#DC2626',
    doctorCount: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hospilink.com',
    phone: '+1-555-0123',
    specialization: 'Interventional Cardiology',
    departmentId: '1',
    qualification: ['MD', 'PhD', 'FACC'],
    experience: 15,
    bio: 'Dr. Sarah Johnson is a board-certified interventional cardiologist with over 15 years of experience in treating complex heart conditions.',
    rating: 4.9,
    reviewCount: 147,
    location: 'Downtown Medical Center',
    consultationFee: 200,
    availableSlots: ['09:00', '10:30', '14:00', '15:30'],
    languages: ['English', 'Spanish'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@hospilink.com',
    phone: '+1-555-0124',
    specialization: 'Pediatric Neurology',
    departmentId: '2',
    qualification: ['MD', 'MPH'],
    experience: 12,
    bio: 'Dr. Michael Chen specializes in pediatric neurology, focusing on developmental disorders and epilepsy in children.',
    rating: 4.8,
    reviewCount: 89,
    location: 'North Campus',
    consultationFee: 180,
    availableSlots: ['08:30', '11:00', '13:30', '16:00'],
    languages: ['English', 'Mandarin'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@hospilink.com',
    phone: '+1-555-0125',
    specialization: 'Orthopedic Surgery',
    departmentId: '3',
    qualification: ['MD', 'FAAOS'],
    experience: 18,
    bio: 'Dr. Emily Rodriguez is an experienced orthopedic surgeon specializing in joint replacement and sports medicine.',
    rating: 4.9,
    reviewCount: 203,
    location: 'West Wing',
    consultationFee: 220,
    availableSlots: ['07:00', '12:00', '14:30'],
    languages: ['English', 'Spanish', 'Portuguese'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@hospilink.com',
    phone: '+1-555-0126',
    specialization: 'General Pediatrics',
    departmentId: '4',
    qualification: ['MD', 'FAAP'],
    experience: 10,
    bio: 'Dr. David Thompson provides comprehensive care for children from infancy through adolescence.',
    rating: 4.7,
    reviewCount: 156,
    location: 'East Clinic',
    consultationFee: 150,
    availableSlots: ['09:00', '10:00', '11:00', '15:00', '16:00'],
    languages: ['English'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Lisa Patel',
    email: 'lisa.patel@hospilink.com',
    phone: '+1-555-0127',
    specialization: 'Cosmetic Dermatology',
    departmentId: '5',
    qualification: ['MD', 'FAAD'],
    experience: 8,
    bio: 'Dr. Lisa Patel specializes in both medical and cosmetic dermatology, helping patients achieve healthy, beautiful skin.',
    rating: 4.8,
    reviewCount: 112,
    location: 'Downtown Medical Center',
    consultationFee: 175,
    availableSlots: ['10:00', '11:30', '14:00', '15:30', '17:00'],
    languages: ['English', 'Hindi', 'Gujarati'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Robert Kim',
    email: 'robert.kim@hospilink.com',
    phone: '+1-555-0128',
    specialization: 'Emergency Medicine',
    departmentId: '6',
    qualification: ['MD', 'FACEP'],
    experience: 14,
    bio: 'Dr. Robert Kim is an emergency medicine physician with extensive experience in trauma care and critical medicine.',
    rating: 4.6,
    reviewCount: 78,
    location: 'Downtown Medical Center',
    consultationFee: 300,
    availableSlots: ['24/7 Emergency'],
    languages: ['English', 'Korean'],
    isAvailable: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockPatients: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    phone: '+1-555-1001',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    address: '123 Main St, Anytown, AT 12345',
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-1002',
      relationship: 'Spouse'
    },
    role: 'patient',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    email: 'mary.smith@example.com',
    name: 'Mary Smith',
    phone: '+1-555-1003',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    address: '456 Oak Ave, Somewhere, SW 67890',
    emergencyContact: {
      name: 'Robert Smith',
      phone: '+1-555-1004',
      relationship: 'Father'
    },
    role: 'patient',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    departmentId: '1',
    date: '2024-02-15',
    time: '10:30',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    symptoms: 'Chest pain and shortness of breath',
    notes: 'First time patient, referred by family doctor',
    paymentStatus: 'pending',
    amount: 200,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '4',
    departmentId: '4',
    date: '2024-02-16',
    time: '15:00',
    duration: 45,
    type: 'routine-checkup',
    status: 'confirmed',
    symptoms: 'Annual pediatric checkup',
    notes: 'Regular patient, good health history',
    paymentStatus: 'paid',
    amount: 150,
    createdAt: '2024-02-02T00:00:00Z',
    updatedAt: '2024-02-02T00:00:00Z'
  }
];

export const mockReviews: Review[] = [
  {
    id: '1',
    doctorId: '1',
    patientId: '1',
    appointmentId: '1',
    rating: 5,
    comment: 'Dr. Johnson was very thorough and explained everything clearly. Excellent care!',
    isAnonymous: false,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '2',
    doctorId: '4',
    patientId: '2',
    appointmentId: '2',
    rating: 5,
    comment: 'Great with children! My daughter felt comfortable throughout the visit.',
    isAnonymous: false,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Sarah Johnson is tomorrow at 10:30 AM',
    type: 'reminder',
    isRead: false,
    actionUrl: '/appointments/1',
    createdAt: '2024-02-14T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. David Thompson has been confirmed for Feb 16 at 3:00 PM',
    type: 'appointment',
    isRead: true,
    actionUrl: '/appointments/2',
    createdAt: '2024-02-02T00:00:00Z'
  }
];

// Helper functions for mock data
export const getDoctorById = (id: string): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.id === id);
};

export const getDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find(department => department.id === id);
};

export const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.patientId === patientId);
};

export const getAppointmentsByDoctorId = (doctorId: string): Appointment[] => {
  return mockAppointments.filter(appointment => appointment.doctorId === doctorId);
};

export const getDoctorsByDepartmentId = (departmentId: string): Doctor[] => {
  return mockDoctors.filter(doctor => doctor.departmentId === departmentId);
};
