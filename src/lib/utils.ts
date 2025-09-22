/**
 * Utility Functions and Helpers
 * Common utility functions used throughout the application
 */

import { type ClassValue, clsx } from 'clsx';
import { format, parseISO, isToday, isTomorrow, isYesterday, addDays, isBefore, isAfter } from 'date-fns';

/**
 * Utility function to merge class names
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatString: string = 'PPP'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}

/**
 * Get relative date string (Today, Tomorrow, etc.)
 */
export function getRelativeDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) return 'Today';
    if (isTomorrow(dateObj)) return 'Tomorrow';
    if (isYesterday(dateObj)) return 'Yesterday';
    
    return formatDate(dateObj, 'MMM dd, yyyy');
  } catch (error) {
    console.error('Error getting relative date:', error);
    return 'Invalid date';
  }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isBefore(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(dateObj, new Date());
  } catch (error) {
    console.error('Error checking if date is future:', error);
    return false;
  }
}

/**
 * Generate available dates for booking (next 30 days)
 */
export function getAvailableDates(excludeWeekends: boolean = false): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, i);
    
    if (excludeWeekends) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip Sunday (0) and Saturday (6)
    }
    
    dates.push(format(date, 'yyyy-MM-dd'));
  }
  
  return dates;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

/**
 * Get status color based on appointment status
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    case 'rescheduled':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get rating stars display
 */
export function getRatingStars(rating: number): string {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  return stars;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Validate appointment creation payload (mirrors backend constraints for AppointmentCreateDto)
export function validateAppointmentCreate(payload: import('./types').AppointmentCreateDto): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?/; // loose ISO local datetime check
  if (!payload.appointmentStartTime || !isoRegex.test(payload.appointmentStartTime)) {
    errors.push('Invalid or missing appointmentStartTime');
  }
  if (!payload.appointmentEndTime || !isoRegex.test(payload.appointmentEndTime)) {
    errors.push('Invalid or missing appointmentEndTime');
  }
  if (payload.appointmentStartTime && payload.appointmentEndTime) {
    const start = new Date(payload.appointmentStartTime.replace(' ', 'T'));
    const end = new Date(payload.appointmentEndTime.replace(' ', 'T'));
    if (start >= end) errors.push('End time must be after start time');
  }
  if (!payload.userId?.trim()) errors.push('userId is required');
  if (!payload.usersFullName?.trim()) errors.push('Full name is required');
  if (!payload.usersEmail?.trim()) errors.push('Email is required');
  if (!payload.doctorId?.trim()) errors.push('doctorId is required');
  if (!payload.reason?.trim()) errors.push('Reason is required');
  else if (payload.reason.length > 250) errors.push('Reason cannot exceed 250 characters');
  return { valid: errors.length === 0, errors };
}

/**
 * Sort array by property
 */
export function sortBy<T>(array: T[], property: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter array by search term
 */
export function filterBySearch<T>(
  array: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return array;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return array.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch);
      }
      return false;
    })
  );
}

/**
 * Group array by property
 */
export function groupBy<T>(array: T[], property: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(item[property]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Local storage utilities
 */
export const storage = {
  get: <T = unknown>(key: string): T | null => {
    try {
      if (typeof window === 'undefined') return null;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  set: (key: string, value: unknown): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}
