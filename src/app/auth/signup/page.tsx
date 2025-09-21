/**
 * Sign Up Page
 * Professional hospital registration with multi-step flow
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Check, Loader2, ArrowLeft, Stethoscope, UserRound } from 'lucide-react';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { authAPI } from '@/lib/api-services';

// Aligning frontend form with backend UserRegistrationDto
// Backend DTO fields:
// firstName, middleName, lastName, username, email, password, age, gender,
// phoneNumber, address, city, state, country, zipCode
interface SignUpFormData {
  email: string;
  otp: string;              // 6-digit verification code
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  password: string;
  confirmPassword: string;
  age: string;              // keep as string for controlled input, convert to number on submit
  gender: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Local DTO type matching backend registration expectations

type SignUpStep = 'email' | 'otp' | 'details' | 'success';

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<SignUpStep>('email');
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    otp: '',
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    age: '',
  gender: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Auth is managed globally; after success redirect to signin

  // Sanitize and enforce 10-digit local phone number (backend column length=10)
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10); // keep max 10 digits
    setFormData(prev => ({ ...prev, phoneNumber: digitsOnly }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Sending OTP to:', formData.email);
      const response = await authAPI.sendOTP(formData.email);
      console.log('OTP Response:', response);
      setCurrentStep('otp');
    } catch (error) {
      console.error('OTP Error:', error);
  setError(`Failed to send OTP. Please check if backend server is running on ${process.env.NEXT_PUBLIC_API_URL || 'configured API URL'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Verifying OTP:', formData.otp, 'for email:', formData.email);
      const response = await authAPI.verifyOTP(formData.email, formData.otp);
      console.log('OTP Verification Response:', response);
      setCurrentStep('details');
    } catch (error) {
      console.error('OTP Verification Error:', error);
  setError(`Invalid OTP. Please check if backend server is running on ${process.env.NEXT_PUBLIC_API_URL || 'configured API URL'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

  // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Validate age range per backend constraints
    const ageNum = Number(formData.age);
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be between 1 and 120.');
      return;
    }

    // Validate gender required
    if (!formData.gender.trim()) {
      setError('Please select your gender.');
      return;
    }

    setIsLoading(true);

    try {
      // Validate phone number length matches backend constraint
      if (formData.phoneNumber.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setIsLoading(false);
        return;
      }
      // Build DTO matching backend expectations
      const dto = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: ageNum,
        gender: formData.gender.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode.trim(),
      };

      console.log('Submitting registration DTO:', dto);

  const response = await authAPI.completeRegistration(dto);
      console.log('Registration Response:', response);
      // Registration successful, redirect to login page
      setCurrentStep('success');
      setTimeout(() => {
        window.location.href = '/auth/signin';
      }, 1200);
    } catch (error) {
      console.error('Registration Error:', error);
  setError(`Failed to create account. Please check if backend server is running on ${process.env.NEXT_PUBLIC_API_URL || 'configured API URL'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-up handled via shared GoogleSignInButton component now

  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: 'Email', icon: Mail },
      { key: 'otp', label: 'Verify', icon: Check },
  { key: 'details', label: 'Details', icon: UserRound }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isActive ? 'bg-blue-600 text-white' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-px mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join HospiLink to access premium healthcare services</p>
      </div>

      <div className="space-y-6">
        {/* Google Sign Up */}
        <GoogleSignInButton variant="custom" onError={setError} />
        {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <p className="mt-2 text-xs text-red-600">Google client ID not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local.</p>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400 focus:placeholder-gray-300 text-gray-900"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Send Verification Code <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  // Enhanced OTP input with 6 separate boxes for better visibility
  const renderOtpStep = () => {
    const otpDigits = Array.from({ length: 6 }, (_, i) => formData.otp[i] || '');

    const updateDigit = (index: number, value: string) => {
      if (!/^[0-9]?$/.test(value)) return; // only allow digits
      const chars = formData.otp.split('');
      chars[index] = value;
      const newOtp = chars.join('').slice(0, 6);
      setFormData({ ...formData, otp: newOtp });
      // Auto-focus next input
      if (value && index < 5) {
        const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;
        next?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
        const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;
        prev?.focus();
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
            <p className="text-gray-600">
              We&apos;ve sent a verification code to<br />
              <span className="font-medium text-blue-600">{formData.email}</span>
            </p>
        </div>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 rounded-xl border-2 border-gray-200 bg-white text-center text-2xl font-medium tracking-wider focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm text-gray-900"
                  placeholder="•"
                  required
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">Enter the 6-digit code from your email</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep('email')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.otp.length !== 6}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleEmailSubmit}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
            >
              Resend verification code
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h2>
        <p className="text-gray-600">Enter your details to finish creating your account</p>
      </div>
      <form onSubmit={handleDetailsSubmit} className="space-y-5">
        {/* Name fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="First"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
            <input
              type="text"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Middle (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Last"
              required
            />
          </div>
        </div>
        {/* Username & Age */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min={1}
              max={120}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Age"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        {/* Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            value={formData.phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900 tracking-widest"
            placeholder="10-digit phone"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter 10 digits (no country code). Backend column length is 10.</p>
        </div>
        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
            placeholder="Street address"
            rows={2}
            required
          />
        </div>
        {/* Location details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="City"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="State"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Country"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Zip / Postal code"
              required
            />
          </div>
        </div>
        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Create a strong password"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all placeholder-gray-400 text-gray-900"
              placeholder="Re-enter password"
              minLength={8}
              required
            />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentStep('otp')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Success message step
  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Check className="w-16 h-16 text-green-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
      <p className="text-gray-600 mb-4">You will be redirected to the login page.</p>
      <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Go to Login</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-3xl font-bold">HospiLink</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                Join Thousands of<br />
                <span className="text-blue-200">Satisfied Patients</span>
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Experience seamless healthcare management with our state-of-the-art platform. 
                Book appointments, manage records, and connect with top medical professionals.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-blue-100">Instant appointment booking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-blue-100">Secure health record management</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-blue-100">24/7 healthcare support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-900">HospiLink</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {renderStepIndicator()}
              
              {currentStep === 'email' && renderEmailStep()}
              {currentStep === 'otp' && renderOtpStep()}
              {currentStep === 'details' && renderDetailsStep()}
              {currentStep === 'success' && renderSuccessStep()}

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Terms */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// removed obsolete login stub

