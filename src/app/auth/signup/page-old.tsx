/**
 * Sign Up Page
 * Email submission and OTP verification flow
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Check, Loader2, ArrowLeft } from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

interface SignUpFormData {
  email: string;
  otp: string;
}

type SignUpStep = 'email' | 'otp' | 'success';

export default function SignUpPage() {
  const [currentStep, setCurrentStep] = useState<SignUpStep>('email');
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Simulate success response
      console.log('OTP sent to:', formData.email);
      setCurrentStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate OTP verification
      if (formData.otp === '123456') {
        setCurrentStep('success');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('OTP resent to:', formData.email);
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-hospital-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-hospital-dark mb-2">Get Started</h1>
        <p className="text-gray-600">Enter your email to create your HospiLink account</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hospital-accent focus:border-transparent transition-colors"
            placeholder="Enter your email address"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.email}
          className="w-full bg-hospital-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-hospital-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending OTP...
            </>
          ) : (
            <>
              Continue <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-hospital-accent hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );

  const renderOtpStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-hospital-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-hospital-dark mb-2">Verify Your Email</h1>
        <p className="text-gray-600">
          We&apos;ve sent a verification code to{' '}
          <span className="font-medium text-hospital-dark">{formData.email}</span>
        </p>
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="otp"
            required
            maxLength={6}
            value={formData.otp}
            onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hospital-accent focus:border-transparent transition-colors text-center text-2xl tracking-widest"
            placeholder="123456"
          />
          <p className="text-sm text-gray-500 mt-2">Enter the 6-digit code sent to your email</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || formData.otp.length !== 6}
          className="w-full bg-hospital-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-hospital-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify & Continue <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-hospital-accent hover:underline font-medium disabled:opacity-50"
        >
          Resend verification code
        </button>
        
        <div>
          <button
            onClick={() => setCurrentStep('email')}
            className="text-gray-600 hover:text-hospital-accent transition-colors flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Change email address
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 text-white" />
      </div>
      
      <h1 className="text-3xl font-bold text-hospital-dark mb-4">Welcome to HospiLink!</h1>
      <p className="text-gray-600 mb-8">
        Your account has been successfully created. You can now access your patient portal and book appointments.
      </p>

      <div className="space-y-4">
        <Link
          href="/portal"
          className="w-full bg-hospital-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-hospital-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          Go to Patient Portal <ArrowRight className="w-5 h-5" />
        </Link>
        
        <Link
          href="/appointment"
          className="w-full border-2 border-hospital-accent text-hospital-accent py-3 px-4 rounded-lg font-medium hover:bg-hospital-accent hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          Book Your First Appointment
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader variant="light" />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {currentStep === 'email' && renderEmailStep()}
            {currentStep === 'otp' && renderOtpStep()}
            {currentStep === 'success' && renderSuccessStep()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
