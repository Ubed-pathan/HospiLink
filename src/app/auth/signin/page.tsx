/**
 * Sign In Page
 * Professional hospital authentication page
 */

'use client';


import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Loader2, ArrowRight, Stethoscope, Heart, Shield } from 'lucide-react';
import { authAPI } from '@/lib/api-services';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';


export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Rely on AuthProvider broadcast to navigate to landing once authenticated
  useEffect(() => {
    // Always send to landing page; RouteGuard will handle role-based redirects
    const destinationFor = () => '/';
    const initial = window.__HOSPILINK_AUTH__?.isAuthenticated;
    if (initial) {
      router.replace(destinationFor());
    }

    const onReady = (e: Event) => {
      const detail = (e as CustomEvent).detail as { isAuthenticated: boolean } | undefined;
      if (detail?.isAuthenticated) {
        router.replace(destinationFor());
      }
    };
    window.addEventListener('hospilink-auth-ready', onReady, { once: true });
    return () => window.removeEventListener('hospilink-auth-ready', onReady);
  }, [router]);

  const GoogleButton = useMemo(() => dynamic(() => import('@/components/auth/GoogleSignInButton'), { ssr: false }), []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Custom validation to avoid native browser popup alerts
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
  setIsSubmitting(true);
    try {
      await authAPI.signin(username, password);
      // Refresh auth state immediately and broadcast for guards/listeners
      try {
        const resp = await authAPI.loadOnRefresh();
        type RefreshPayload = {
          id: string;
          email?: string;
          username?: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
          roles?: string[] | Set<string>;
          role?: string;
        };
        const data = resp as unknown as RefreshPayload;
        const backendRoles = Array.isArray(data.roles) ? data.roles : (data.roles instanceof Set ? Array.from(data.roles) : []);
        const roles = backendRoles
          .map((r) => String(r).toLowerCase())
          .map((r) => (r === 'user' ? 'patient' : r))
          .filter((r) => r === 'patient' || r === 'doctor' || r === 'admin') as Array<'patient' | 'doctor' | 'admin'>;
        const primary: 'patient' | 'doctor' | 'admin' = roles.includes('admin') ? 'admin' : roles.includes('doctor') ? 'doctor' : 'patient';
        const displayNameRaw = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ').trim();
        const displayName = displayNameRaw || data.username || (data.email ? String(data.email).split('@')[0] : '') || 'User';
        const user = { id: data.id, email: data.email || '', name: displayName, username: data.username, role: primary, roles };
        if (typeof window !== 'undefined') {
          try {
            type WUser = { role?: 'patient' | 'doctor' | 'admin'; roles?: Array<'patient' | 'doctor' | 'admin'> };
            (window as unknown as { __HOSPILINK_AUTH__?: { isAuthenticated: boolean; user?: WUser } }).__HOSPILINK_AUTH__ = { isAuthenticated: true, user };
            window.dispatchEvent(new CustomEvent('hospilink-auth-ready', { detail: { isAuthenticated: true, user } }));
          } catch {}
        }
      } catch {}
      // Navigate to landing; RouteGuard will handle role-based redirects
      router.replace('/');
  } catch {
      setError(`Invalid username or password. Please check if backend server is running on ${process.env.NEXT_PUBLIC_API_URL || 'configured API URL'}`);
    } finally {
    setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
              <span className="text-3xl font-bold">HospiLink</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight">
                Welcome to the Future of<br />
                <span className="text-blue-200">Healthcare Management</span>
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Connect with top healthcare professionals, book appointments seamlessly, 
                and manage your health records all in one secure platform.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-sm text-blue-100">Trusted Care</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-sm text-blue-100">Secure Platform</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <p className="text-sm text-blue-100">Expert Doctors</p>
              </div>
            </div>
            
            <div className="text-center text-blue-100 text-sm">
              <p>&ldquo;Transforming healthcare one appointment at a time&rdquo;</p>
            </div>
          </div>
        </div>

        {/* Right Side - Authentication Form */}
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
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to access your healthcare dashboard</p>
              </div>

              <div className="space-y-6">
                {/* Google OAuth Button (decorated native variant) */}
                <div className="w-full">
                  <GoogleButton
                    variant="decorated"
                    onError={(m: string)=> setError(m)}
                    size="large"
                    text="continue_with"
                    theme="outline"
                    shape="pill"
                  />
                  {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <p className="mt-2 text-xs text-red-600">Google client ID not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your .env.local.</p>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
                  </div>
                </div>

                {/* Email Sign In Form */}
                <form onSubmit={handleEmailSignIn} noValidate className="space-y-4" autoComplete="off">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400 focus:placeholder-gray-300 text-gray-900 ${error && error.toLowerCase().includes('username') ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'}`}
                      placeholder="Enter your username"
                      autoComplete="username"
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white placeholder-gray-400 focus:placeholder-gray-300 text-gray-900 ${error && error.toLowerCase().includes('password') ? 'border-red-400 focus:ring-red-300' : 'border-gray-200'}`}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                    />
                    {error && <p className="mt-2 text-xs text-red-600 flex items-center gap-1">{error}</p>}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Removed standalone error alert box as requested; inline error shown below password field */}

              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                    Forgot your password?
                  </Link>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      Create account
                    </Link>
                  </p>
                </div>
              </div>

              {/* Demo notice removed as requested */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
