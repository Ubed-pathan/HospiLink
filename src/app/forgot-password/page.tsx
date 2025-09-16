'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/api-services';
import { ArrowLeft, Mail, Clock, ShieldCheck } from 'lucide-react';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // timer state
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const now = useNow(1000);
  const remaining = useMemo(() => {
    if (!otpExpiresAt) return 0;
    const diff = Math.max(0, Math.floor((otpExpiresAt - now) / 1000));
    return diff;
  }, [otpExpiresAt, now]);

  const canResend = remaining === 0 && step === 'otp';
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const sendOtp = async () => {
    setError(null);
    setMessage(null);
    const e = email.trim();
    if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.sendForgetOtp(e);
      const msg = typeof res === 'string' ? res : res?.message || 'OTP sent to email.';
      setMessage(msg);
      setStep('otp');
      setOtp('');
      setOtpExpiresAt(Date.now() + OTP_TTL_SECONDS * 1000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown }; message?: string };
      const data = e?.response?.data as { message?: string } | string | undefined;
      setError(typeof data === 'string' ? data : (data?.message || e?.message || 'Failed to send OTP'));
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setMessage(null);
    const e = email.trim();
    const o = otp.trim();
    if (!e || !o) {
      setError('Email and OTP are required.');
      return;
    }
    if (remaining === 0) {
      setError('OTP expired. Please resend a new OTP.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.verifyOTP(e, o);
      const msg = typeof res === 'string' ? res : (res?.message || 'OTP verified.');
      setMessage(msg);
      setStep('password');
      setPassword('');
      setConfirm('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown }; message?: string };
      const data = e?.response?.data as { message?: string } | string | undefined;
      setError(typeof data === 'string' ? data : (data?.message || e?.message || 'Invalid OTP'));
    } finally {
      setSubmitting(false);
    }
  };

  const submitNewPassword = async () => {
    setError(null);
    setMessage(null);
    const e = email.trim();
    const p = password.trim();
    const c = confirm.trim();
    if (!e || !p || !c) {
      setError('Please fill all fields.');
      return;
    }
    if (p.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (p !== c) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.forgotPassword(e, p);
      const msg = typeof res === 'string' ? res : (res?.message || 'Password updated successfully.');
      setMessage(msg);
      // Redirect back to sign in after a short delay
      setTimeout(() => { window.location.href = '/auth/signin'; }, 1200);
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown }; message?: string };
      const data = e?.response?.data as { message?: string } | string | undefined;
      setError(typeof data === 'string' ? data : (data?.message || e?.message || 'Failed to update password'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/auth/signin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back to Sign in
          </Link>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-600">Reset your password in three quick steps</p>
        </div>

        {step === 'email' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900">Email</label>
            <div className="relative">
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              onClick={sendOtp}
              disabled={submitting}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">OTP</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit code"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Expires in {mm}:{ss}</span>
              <button
                onClick={sendOtp}
                disabled={!canResend || submitting}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
            <button
              onClick={verifyOtp}
              disabled={submitting}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Verifying…' : 'Verify OTP'}
            </button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900">New Password</label>
              <input
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900">Confirm Password</label>
              <input
                type="password"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black bg-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <button
              onClick={submitNewPassword}
              disabled={submitting}
              className="w-full px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        )}

        {(message || error) && (
          <div className={`mt-4 text-sm rounded border px-3 py-2 ${message ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message || error}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500 flex items-center gap-1 justify-center">
          <ShieldCheck className="w-4 h-4" />
          We keep your account secure. OTPs expire in 10 minutes.
        </div>
      </div>
    </div>
  );
}

function useNow(intervalMs: number) {
  const [t, setT] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}
