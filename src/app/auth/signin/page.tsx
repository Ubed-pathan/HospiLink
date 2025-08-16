/**
 * Sign In Page
 * Google OAuth authentication
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import NavHeader from '@/components/layout/NavHeader';
import Footer from '@/components/layout/Footer';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Mock Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate OAuth delay
      
      // In a real app, this would redirect to Google OAuth
      console.log('Initiating Google OAuth...');
      
      // Simulate successful sign-in
      // window.location.href = '/portal';
      
      // For demo purposes, show success message
      alert('Google OAuth would redirect here. Demo: Sign-in successful!');
    } catch {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    // For users who signed up with email/OTP
    alert('Email sign-in coming soon! For now, please use Google OAuth.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavHeader variant="light" />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-hospital-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-hospital-dark mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to access your HospiLink account</p>
            </div>

            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Email Sign In Button */}
              <button
                onClick={handleEmailSignIn}
                className="w-full bg-hospital-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-hospital-accent/90 transition-colors flex items-center justify-center gap-2"
              >
                Sign in with Email <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="mt-8 text-center space-y-4">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-hospital-accent hover:underline font-medium">
                  Sign up for free
                </Link>
              </p>
              
              <div className="text-sm text-gray-500">
                <Link href="/forgot-password" className="hover:text-hospital-accent transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Information</h3>
              <p className="text-xs text-blue-600">
                This is a demo application. Google OAuth integration would be implemented with a real OAuth provider in production.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
