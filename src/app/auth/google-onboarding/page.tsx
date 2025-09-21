"use client";
import React, { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api-services';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  username: string;
  age: string;
  gender: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export default function GoogleOnboardingPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'profile' | 'success'>('profile');
  const [form, setForm] = useState<FormState>({
    email: '',
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    age: '',
    gender: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  // Prefill from query string (email & name)
  useEffect(() => {
    const email = params.get('email') || '';
    const name = params.get('name') || '';
    if (email) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      setForm(f => ({
        ...f,
        email,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
        username: email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '').slice(0,30)
      }));
    }
  }, [params]);

  const update = (field: keyof FormState, value: string) => setForm(f => ({ ...f, [field]: value }));

  const validate = (): string | null => {
    if (!form.email) return 'Email missing';
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.username.trim()) return 'Username is required';
    if (form.username.length < 3) return 'Username must be at least 3 characters';
    if (form.age) {
      const n = Number(form.age);
      if (!Number.isFinite(n) || n < 1 || n > 120) return 'Age must be between 1 and 120';
    }
    if (form.phoneNumber && form.phoneNumber.length !== 10) return 'Phone number must be 10 digits';
    if (!form.gender) return 'Select a gender';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) { setError(v); return; }
    setSubmitting(true);
    try {
      const dto = {
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || null,
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        // Backend still expects password field; generate a random one so user can later change it
        password: crypto.randomUUID(),
        age: form.age ? Number(form.age) : 0,
        gender: form.gender,
        phoneNumber: form.phoneNumber,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        zipCode: form.zipCode.trim(),
      };
      await authAPI.completeOnboarding(dto as unknown as Record<string, unknown>);
      setStep('success');
      setTimeout(()=> router.replace('/'), 1200);
    } catch (err: unknown) {
      const maybe = err as { response?: { data?: unknown } }; 
      const msg = (typeof maybe.response?.data === 'string' ? maybe.response?.data : undefined) || (maybe as { message?: string }).message || 'Failed to complete onboarding';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Account Created</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">We imported your Google email. Please finish the required details.</p>
        </div>
        <form onSubmit={submit} className="space-y-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={form.email} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input value={form.username} onChange={e=>update('username', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Choose a username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input value={form.firstName} onChange={e=>update('firstName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input value={form.lastName} onChange={e=>update('lastName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name (optional)</label>
              <input value={form.middleName} onChange={e=>update('middleName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input value={form.age} onChange={e=>update('age', e.target.value.replace(/[^0-9]/g,''))} placeholder="" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={form.gender} onChange={e=>update('gender', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (10 digits)</label>
              <input value={form.phoneNumber} onChange={e=>update('phoneNumber', e.target.value.replace(/[^0-9]/g,'').slice(0,10))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={e=>update('address', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e=>update('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input value={form.state} onChange={e=>update('state', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input value={form.country} onChange={e=>update('country', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input value={form.zipCode} onChange={e=>update('zipCode', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link href="/auth/signin" className="text-sm text-gray-500 hover:text-gray-700">Back to sign in</Link>
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Finish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
