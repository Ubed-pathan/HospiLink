/**
 * Input Component
 * Reusable input component with validation states
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Optional class override for the label element (e.g., to darken label color in light mode) */
  labelClassName?: string;
  /** Optional class override for icon color (applies to left/right icon wrappers) */
  iconClassName?: string;
  /**
   * When true, error styles will use the hospital theme accent colors instead of red.
   * Defaults to false to preserve existing behavior.
   */
  brandError?: boolean;
  /**
   * Tone controls the focus ring and active border color.
   * - 'brand' uses hospital-accent (default)
   * - 'blue' uses blue-600
   */
  tone?: 'brand' | 'blue';
  /**
   * Force light appearance (white background) even in dark mode contexts.
   */
  forceLight?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, labelClassName, iconClassName, brandError = false, tone = 'brand', forceLight = false, type = 'text', ...props }, ref) => {
    const inputId = props.id || props.name;
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={cn('block text-sm font-medium', labelClassName ?? 'text-gray-700 dark:text-gray-300')}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className={cn('h-5 w-5', iconClassName ?? 'text-gray-400')}>
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'block w-full rounded-lg border px-3 py-2.5 text-sm placeholder-gray-500 transition-colors',
              'focus:outline-none focus:ring-2',
              tone === 'blue' ? 'focus:ring-blue-600 focus:border-blue-600' : 'focus:ring-hospital-accent focus:border-transparent',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              error
                ? (
                  brandError
                    ? (tone === 'blue'
                        ? 'border-blue-600 text-gray-900 placeholder-blue-600/60 focus:ring-blue-600 focus:border-blue-600'
                        : 'border-hospital-accent text-hospital-primary placeholder-hospital-accent/60 focus:ring-hospital-accent focus:border-hospital-accent')
                    : 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                )
                : (
                  forceLight
                    ? 'border-gray-300 dark:border-gray-300 dark:bg-white dark:text-gray-900'
                    : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                ),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className={cn('h-5 w-5', iconClassName ?? 'text-gray-400')}>
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={`${inputId}-error`}
            className={cn(
              'text-sm',
              brandError ? (tone === 'blue' ? 'text-blue-600' : 'text-hospital-accent') : 'text-red-600 dark:text-red-400'
            )}
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
